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

        this.shadowFilter = new PIXI.filters.DropShadowFilter({
            distance: 2,
            blur: 2,
            alpha: 0.5,
            resolution: 2
        })
        
        this.bubbleStage.filters = [ this.shadowFilter ]

        this.totalBubbles = { value: 0 }

        appContext.pixiApp.stage.addChild(this.bubbleStage)

        PIXI.Loader.shared.onStart.add(() => console.log('Starting...'))
        PIXI.Loader.shared.onProgress.add(() => $('#loading-message').text(`${Math.floor(PIXI.Loader.shared.progress)}%`))
        PIXI.Loader.shared.onComplete.add(startBubbleAdder)

        this.tapEventQueue = []
        this.$widgetContainer = $('.widget-container')

        this.setIdle(true)

        $('body')
            .on('pointerdown', evnt =>
            {
                // if user clicks outside of bubble, exit active bubble
                // can't simply call stopPropagation by bubble because body's pointerdown is used to detect pointertype
                // and we can't cancel it. Instead, we keep boolean in shared context


                if (!this.bubblePointerDownCalled.value && this.currentActiveBubble.value)
                    this.currentActiveBubble.value.exit(true)
                this.bubblePointerDownCalled.value = false

                this.mouseIn = true
                this.checkWidgetAccessAttempt(evnt.pageY)

            }).on('pointerout', () => {
                if (this.currentActiveBubble.value && this.appContext.lastCursor.isMouse)
                    this.currentActiveBubble.value.exit(true)
            }).mouseleave(() => {
                this.mouseIn = false
                if (!this.$widgetContainer.hasClass('hidden'))
                    this.killWidgetDelayed()
            }).mouseenter(() => this.mouseIn = true)

        $('#loading-message').hide()
        this.$widgetContainer
        // TODO get shit to work when mouse is over widget container
        //     .bind('pointerover pointerdown pointerup pointercancel pointermove pointerout', evnt => {
        //         const app = this.appContext.pixiApp
        //         const interMnger = app.renderer.plugins.interaction

        //         var interactionData = interMnger.getInteractionDataForPointerId(interMnger.normalizeToPointerData(evnt)[0]);
        //         var interactionEvent = interMnger.configureInteractionEventForDOMEvent(interMnger.eventData, evnt, interactionData);
        //         interactionEvent.data.originalEvent = evnt;

        //         // const hitObject = interMnger.hitTest(interactionData.global, app.stage)

        //         // if (hitObject)
        //         //     hitObject.emit(evnt.type, interactionEvent)

        //         interMnger.processInteractive(interactionEvent, app.stage, interMnger.processPointerOverOut, true)
        //     })
            .addClass('hidden').hide()
            .focusout(() => this.widgetFocused = false)

        $('.field-widget').focus(() => {
            this.widgetSetVisible(true)
            this.widgetFocused = true
        })
            
        $('#search-button').click(() => {
            this.$widgetContainer.hide()
            this.appContext.application.requestStateChange('push', 'searchState')
        })
        $('#toggle-shadows').click(() => {
            if (this.bubbleStage.filters.length === 0)
                this.bubbleStage.filters = [ this.shadowFilter ]
            else
                this.bubbleStage.filters = []
        })

        function startBubbleAdder()
        {
            (function addBubble()
            {
                if (self.bubbles.length === self.totalBubbles.value)
                {
                    self._bubbleSlower = setTimeout(() => self.velocityDecreaseRate = 0.998, 2000)
                    self.bubblesAllAdded = true
                    self.showWidgetTemporarily()
                }
                else
                {
                    self.bubbles.push(self.bubbleQueue[self.bubbles.length])
                    setTimeout(addBubble, 1000 / 15)
                }
            })()
        }
    }

    enter(options)
    {
        this.update = this.activeUpdate

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
            tapEventQueue: this.tapEventQueue,
            totalBubbles: this.totalBubbles
        }
        
        $('#loading-message').text('Loading...').show()
        this.$widgetContainer.show()

        createBubbles(options.vaMALID, this.bubbleQueue, context, this.appContext.application)
    }

    exit()
    {
        this.$widgetContainer.addClass('hidden').hide()
        clearTimeout(this.widgetKiller)
        this.widgetKiller = null
    }

    setIdle(idle)
    {
        if (idle)
            this.update = () => {}
        else
        {
            this.$widgetContainer.show()
            this.update = this.activeUpdate
        }
    }

    activeUpdate(dt)
    {
        // self.tapEventQueue.sort((first, second) => first.priority - second.priority)

        // while (self.tapEventQueue.length != 0)
        //     self.tapEventQueue.shift().callback()

        this.velocityFactor = Math.max(this.velocityFactor *= this.velocityDecreaseRate, 0.5)

        for (const bubble of this.bubbles)
            bubble.update(dt, this.velocityFactor)

        for (let b1 = 0; b1 < this.bubbles.length - 1; b1++)
            for (let b2 = b1 + 1; b2 < this.bubbles.length; b2++)
                resolveCollisionVelocity(this.bubbles[b1], this.bubbles[b2])

        for (let b1 = 0; b1 < this.bubbles.length - 1; b1++)
            for (let b2 = b1 + 1; b2 < this.bubbles.length; b2++)
                correctPositions(this.bubbles[b1], this.bubbles[b2])

        this.checkWidgetAccessAttempt(getMousePos(this.appContext.pixiApp).y)

    }

    checkWidgetAccessAttempt(mouseY)
    {
        const containerVisible = !this.$widgetContainer.hasClass('hidden')

        if (!containerVisible
            && this.mouseIn && mouseY >= (window.innerHeight - parseFloat(this.$widgetContainer.css('font-size')) * 6)
            && this.bubblesAllAdded)
        {
            console.log(mouseY)
            if (!containerVisible)
                this.widgetSetVisible(true)
        }
        else if (containerVisible && !this.widgetKiller && !this.widgetFocused)
            this.killWidgetDelayed()
    }

    showWidgetTemporarily()
    {
        this.widgetSetVisible(true)
        this.killWidgetDelayed()
    }

    killWidgetDelayed()
    {
        this.widgetKiller = setTimeout(() => {
            this.widgetSetVisible(false)
            this.widgetKiller = null
        }, 3000)
    }

    widgetSetVisible(visible)
    {
        if (visible)
        {
            this.$widgetContainer.removeClass('hidden')
            if (this.widgetKiller)
            {
                clearTimeout(this.widgetKiller)
                this.widgetKiller = null
            }
        }
        else
            this.$widgetContainer.addClass('hidden')
    }
}