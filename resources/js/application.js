function Application()
{    
    let _this = this

    this.velocityFactor = 1
    this.velocityDecreaseRate = 0.99995

    this.bubbleQueue = []
    this.bubbles = [] 
    
    setupPIXI()

    PIXI.Loader.shared.onComplete.add(startBubbleAdder)

    function setupPIXI()
    {
        _this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            autoDensity: true,
            transparent: true
        })
    
        _this.app.renderer.view.style.position = 'absolute'
        _this.app.renderer.view.style.display = 'block'
        // let fx = new PIXI.filters.FXAAFilter()
        // app.stage.filters = [ new PIXI.filters.FXAAFilter() ]
        document.body.appendChild(_this.app.view)
        
        _this.app.stage.sortableChildren = true
        _this.app.ticker.add(gameLoop)

        // https://css-tricks.com/building-an-images-gallery-using-pixijs-and-webgl/
        var resizeTimer
        window.addEventListener('resize', () => {
            if (resizeTimer) clearTimeout(resizeTimer)
            resizeTimer = setTimeout(() => 
                    _this.app.renderer.resize(window.innerWidth, window.innerHeight),
                200)
        })
        
        PIXI.Loader.shared.onStart.add(() => console.log('Starting...'))
        PIXI.Loader.shared.onProgress.add(() => $('#loading-message').text(`${Math.floor(PIXI.Loader.shared.progress)}%`))
    }

    function gameLoop(dt)
    {
        _this.velocityFactor = Math.max(_this.velocityFactor *= _this.velocityDecreaseRate, 0.5)
    
        for (const bubble of _this.bubbles)
            bubble.update(dt, _this.velocityFactor)
            
        for (let b1 = 0; b1 < _this.bubbles.length - 1; b1++)
            for (let b2 = b1 + 1; b2 < _this.bubbles.length; b2++)
                resolveCollisionVelocity(_this.bubbles[b1], _this.bubbles[b2])

        for (let b1 = 0; b1 < _this.bubbles.length - 1; b1++)
            for (let b2 = b1 + 1; b2 < _this.bubbles.length; b2++)
                correctPositions(_this.bubbles[b1], _this.bubbles[b2])
    }

    function startBubbleAdder()
    {
        (function addBubble()
        {
            if (_this.bubbleQueue.length == _this.bubbles.length)
                setTimeout(() =>
                {
                    console.log('slowed down')
                    _this.velocityDecreaseRate = 0.998
                }, 2000)
            else
            {
                _this.bubbles.push(_this.bubbleQueue[_this.bubbles.length])
                setTimeout(addBubble, 1000 / 15)
            }
        })()
    }
}

Application.prototype.init = function(vaMALID) 
{
    for (const bubble of this.bubbles)
        bubble.destroy()

    this.velocityFactor = 1
    this.velocityDecreaseRate = 0.99995

    this.bubbleQueue = []
    this.bubbles = [] 
    this.app.stage.removeChildren()

    PIXI.Loader.shared.reset()

    createBubbles(vaMALID, this.bubbleQueue, this.app)
}