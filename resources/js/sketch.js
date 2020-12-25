/// <reference path='/Users/sarah/node_modules/pixi.js/pixi.js.d.ts' />
/// <reference path='/Users/sarah/node_modules/@types/jquery/JQuery.d.ts' />


const FPS = 60,
    FRAME_LEN = 1 / FPS
const INTRO_BUBBLE_EVERY_N_FRAME = 4
const RESTITUTION = 0.1

const MAX_RADIUS = 120
const RADIUS_EXPAND = 10 // how much physical circle expands when hovered
const MAX_STROKE = 10 // stroke thickiness for largest circle
const HOVER_STROKE = 30 // actual stroke for when hovered
const MAX_BUBBLES = 55

let velocityFactor // to prevent bubbles continuously moving after clumping together
let velocityDecreaseRate = 0.99995

let bubbleQueue = []
let bubbles = []
let bubbleGrabbed = false
let mouseDragging = false
let wasClickAction = false
let circleMask
let buffer
let finalBubbleAmt
let hasSlowedDown = false
let frameCount = 0

jQuery(function() {

    if (typeof Object.freeze !== 'function')
    {
        throw new Error('Missing Object.freeze')
    }
    Object.freeze(Bubble.prototype)
    Object.freeze(BubbleAnimation.prototype)
    
    let type = 'WebGL'
    
    if (!PIXI.utils.isWebGLSupported())
        type = 'canvas'
    
    PIXI.utils.sayHello(type)
    
    let app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        autoDensity: true,
        transparent: true
    })

    app.renderer.view.style.position = 'absolute'
    app.renderer.view.style.display = 'block'
    // let fx = new PIXI.filters.FXAAFilter()
    // app.stage.filters = [ new PIXI.filters.FXAAFilter() ]
    document.body.appendChild(app.view)

    const circleGraphic = new PIXI.Graphics()
    circleGraphic.beginFill()
    circleGraphic.drawCircle(0, 0, 100)
    circleGraphic.endFill()
    circleMask = app.renderer.generateTexture(circleGraphic)

    engineInitialize(6686, app)
    
    app.ticker.add(dt => {
        frameCount++

        addBubbles()
        slowdown()
    
        for (const bubble of bubbles)
            bubble.update(dt)
            
        for (let b1 = 0; b1 < bubbles.length - 1; b1++)
            for (let b2 = b1 + 1; b2 < bubbles.length; b2++)
                resolveCollisionVelocity(bubbles[b1], bubbles[b2])

        for (let b1 = 0; b1 < bubbles.length - 1; b1++)
            for (let b2 = b1 + 1; b2 < bubbles.length; b2++)
                correctPositions(bubbles[b1], bubbles[b2])
    })
    
    function setup()
    {
        circleMask = createGraphics(200, 200)
        circleMask.circle(100, 100, 200)
    
        createCanvas(windowWidth, windowHeight).parent('bubble-area')
    
        frameRate(FPS)
        buffer = createGraphics(windowWidth, windowHeight)
        buffer.textAlign(CENTER, BASELINE)
        buffer.imageMode(CENTER)
    }
    
    function draw()
    {
        // wait until all bubbles have been created
        if (finalBubbleAmt && bubbleQueue.length != finalBubbleAmt)
            return
    
        update()
        render()
        wasClickAction = false
    }
    
    function windowResized()
    {
        resizeCanvas(windowWidth, windowHeight)
        buffer = createGraphics(windowWidth, windowHeight)
        buffer.textAlign(CENTER, BASELINE)
        buffer.imageMode(CENTER)
        gravity = windowHeight
    }
    
    function mouseReleased()
    {
        if (!mouseDragging) wasClickAction = true
        bubbleGrabbed = false
        mouseDragging = false
    }
    
    function mouseDragged()
    {
        mouseDragging = true
    }
    
    // https://css-tricks.com/building-an-images-gallery-using-pixijs-and-webgl/
    let resizeTimer
    window.addEventListener('resize', () => {
        if (resizeTimer) clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => 
                app.renderer.resize(window.innerWidth, window.innerHeight),
            200)
    })
    
})