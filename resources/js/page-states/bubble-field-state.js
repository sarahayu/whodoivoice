class BubbleFieldState
{
    constructor(appContext)
    {
        const self = this

        this.appContext = appContext
        this.velocityFactor = 1
        this.velocityDecreaseRate = 0.99995

        this.bubbleQueue = []
        this.bubbles = []
        this.currentActiveBubble = { value: null }
        this.bubblePointerDownCalled = { value: false }

        this.bubbleStage = new PIXI.Container()
        this.bubbleStage.sortableChildren = true
        this.bubbleStage.filters = [ new PIXI.filters.DropShadowFilter({
            distance: 2,
            blur: 2,
            alpha: 0.5,
            resolution: 2
        }) ]

        this.app.stage.addChild(this.bubbleStage)

        PIXI.Loader.shared.onStart.add(() => console.log('Starting...'))
        PIXI.Loader.shared.onProgress.add(() => $('#loading-message').text(`${Math.floor(PIXI.Loader.shared.progress)}%`))
        PIXI.Loader.shared.onComplete.add(startBubbleAdder)

        this.tapEventQueue = []

        $('body')
            .on('pointerdown', evnt =>
            {
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

        function update(dt)
        {
            // self.tapEventQueue.sort((first, second) => first.priority - second.priority)

            // while (self.tapEventQueue.length != 0)
            //     self.tapEventQueue.shift().callback()

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
        this.bubbleStage.removeChildren()

        PIXI.Loader.shared.reset()
        if (this._bubbleSlower)
            clearTimeout(this._bubbleSlower)

        const context = {
            app: this.appContext.pixiApp,
            activeBubble: this.currentActiveBubble,
            lastCursor: this.appContext.lastCursor,
            bubblePointerDownCalled: this.bubblePointerDownCalled,
            bubbleStage: this.bubbleStage,
            tapEventQueue: this.tapEventQueue
        }

        createBubbles(vaMALID, this.bubbleQueue, context)
    }
}