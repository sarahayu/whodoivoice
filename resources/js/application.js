class Application
{
    constructor()
    {
        const self = this

        this.velocityFactor = 1
        this.velocityDecreaseRate = 0.99995

        this.bubbleQueue = []
        this.bubbles = []
        this.currentActiveBubble = { value: null }
        this.lastCursor = { isMouse: true, pointerId: null }
        this.bubblePointerDownCalled = { value: false }

        setupPIXI()

        PIXI.Loader.shared.onStart.add(() => console.log('Starting...'))
        PIXI.Loader.shared.onProgress.add(() => $('#loading-message').text(`${Math.floor(PIXI.Loader.shared.progress)}%`))
        PIXI.Loader.shared.onComplete.add(startBubbleAdder)

        $('body')
            .on('pointerdown', evnt =>
            {
                this.lastCursor.isMouse = evnt.pointerType === 'mouse'
                
                // if user clicks outside of bubble, exit active bubble
                // can't simply call stopPropagation by bubble because body's pointerdown is used to detect pointertype
                // and we can't cancel it. Instead, we keep boolean in shared context
                if (!this.bubblePointerDownCalled.value && this.currentActiveBubble.value)
                    this.currentActiveBubble.value.exit(true)
                this.bubblePointerDownCalled.value = false
            })
            .on('mousemove', () => this.lastCursor.isMouse = true)
            .on('pointerout', () => {
                if (this.currentActiveBubble.value && this.lastCursor.isMouse)
                    this.currentActiveBubble.value.exit(true)
            })

        function setupPIXI()
        {
            self.app = new PIXI.Application({
                width: window.innerWidth,
                height: window.innerHeight,
                autoDensity: true,
                transparent: true,
                antialias: true
            })

            self.app.renderer.view.style.position = 'absolute'
            self.app.renderer.view.style.display = 'block'
            // let fx = new PIXI.filters.FXAAFilter()
            // app.stage.filters = [ new PIXI.filters.FXAAFilter() ]
            const filter = new PIXI.Filter(myVertex, myFragment);
            // first is the horizontal shift, positive is to the right
            // second is the same as scaleY
            filter.uniforms.shadowDirection = [0.4, 0.5];
            filter.uniforms.floorY = 0.0;
            // how big is max shadow shift to the side?
            // try to switch that off ;)
            filter.padding = 100;

            self.app.stage.filters = [ filter ]
            document.body.appendChild(self.app.view)

            self.app.stage.sortableChildren = true
            self.app.ticker.add(gameLoop)

            // https://css-tricks.com/building-an-images-gallery-using-pixijs-and-webgl/
            window.addEventListener('resize', () => {
                if (self.resizeTimer) clearTimeout(self.resizeTimer)
                self.resizeTimer = setTimeout(() => 
                        self.app.renderer.resize(window.innerWidth, window.innerHeight),
                    200)
            })
        }

        function gameLoop(dt)
        {
            self.velocityFactor = Math.max(self.velocityFactor *= self.velocityDecreaseRate, 0.5)

            for (const bubble of self.bubbles)
                bubble.update(dt, self.velocityFactor)

            for (let b1 = 0; b1 < self.bubbles.length - 1; b1++)
                for (let b2 = b1 + 1; b2 < self.bubbles.length; b2++)
                    resolveCollisionVelocity(self.bubbles[b1], self.bubbles[b2])

            for (let b1 = 0; b1 < self.bubbles.length - 1; b1++)
                for (let b2 = b1 + 1; b2 < self.bubbles.length; b2++)
                    correctPositions(self.bubbles[b1], self.bubbles[b2])
        }

        function startBubbleAdder()
        {
            (function addBubble()
            {
                if (self.bubbleQueue.length == 0)
                    setTimeout(addBubble, 1000)
                else if (self.bubbleQueue.length == self.bubbles.length)
                    self._bubbleSlower = setTimeout(() =>
                    {
                        console.log('slowed down')
                        self.velocityDecreaseRate = 0.998
                    }, 2000)

                else
                {
                    self.bubbles.push(self.bubbleQueue[self.bubbles.length])
                    setTimeout(addBubble, 1000 / 15)
                }
            })()
        }
    }

    init(vaMALID)
    {
        for (const bubble of this.bubbles)
            bubble.destroy()

        this.velocityFactor = 1
        this.velocityDecreaseRate = 0.99995

        this.bubbleQueue = []
        this.bubbles = []
        this.app.stage.removeChildren()

        PIXI.Loader.shared.reset()
        if (this._bubbleSlower)
            clearTimeout(this._bubbleSlower)

        const context = {
            app: this.app,
            activeBubble: this.currentActiveBubble,
            lastCursor: this.lastCursor,
            bubblePointerDownCalled: this.bubblePointerDownCalled
        }

        createBubbles(vaMALID, this.bubbleQueue, context)
    }
}

