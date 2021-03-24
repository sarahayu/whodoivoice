class Application
{
    constructor()
    {
        const self = this

        this.lastCursor = { isMouse: true, pointerId: null }

        $('body')
            .on('pointerdown', evnt =>
            {
                this.lastCursor.isMouse = evnt.pointerType === 'mouse'
            })

        setupPIXI()

        this.states = {
            bubbleField: new BubbleFieldState({ 
                pixiApp: this.app, 
                lastCursor: this.lastCursor,
                application: this
            }),
            searchState: new SearchState({
                application: this
            })
        }

        this.stateStack = [ this.states.bubbleField, this.states.searchState ]
        this.stateChangeQueue = []

        this.states.searchState.enter()
        
        this.app.ticker.add(gameLoop)

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
            // const filter = new PIXI.Filter(myVertex, myFragment);
            // // first is the horizontal shift, positive is to the right
            // // second is the same as scaleY
            // filter.uniforms.shadowDirection = [0.4, 0.5];
            // filter.uniforms.floorY = 0.0;
            // // how big is max shadow shift to the side?
            // // try to switch that off ;)
            // filter.padding = 100;

            $('#pixi-area').append(self.app.view)


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
            for (let i = self.stateStack.length - 1; i >= 0; i--)
                self.stateStack[i].update(dt)
            self.processStateQueue()
        }
    }

    init(vaMALID)
    {
        // this.states.bubbleField.init(vaMALID)
    }

    requestStateChanges(changes)
    {
        for (const change of changes)
            this.requestStateChange(change.action, change.state, change.options)
    }

    requestStateChange(action, state, options)
    {
        this.stateChangeQueue.push({ 
            action: action,
            state: state,
            options: options
         })
    }

    processStateQueue()
    {
        while (this.stateChangeQueue.length != 0)
        {
            const stateChange = this.stateChangeQueue.shift()
            switch (stateChange.action)
            {
                case 'push':
                    if (this.stateStack.length != 0)
                        this.stateStack[this.stateStack.length - 1].setIdle(true)
                    const newState = this.states[stateChange.state]
                    newState.enter(stateChange.options)
                    this.stateStack.push(newState)
                    break;
                case 'pop':
                    this.stateStack.pop().exit()
                    if (this.stateStack.length != 0)
                        this.stateStack[this.stateStack.length - 1].setIdle(false)
                    break;
            }
        }
    }
}

