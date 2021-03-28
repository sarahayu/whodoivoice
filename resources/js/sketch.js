/// <reference path='/Users/sarah/node_modules/pixi.js/pixi.js.d.ts' />
/// <reference path='/Users/sarah/node_modules/@types/jquery/JQuery.d.ts' />


const FPS = 60,
    FRAME_LEN = 1 / FPS
const INTRO_BUBBLE_EVERY_N_FRAME = 4
const RESTITUTION = 0.1

const MAX_RADIUS = 120
const RADIUS_EXPAND = 10 // how much physical circle expands when hovered
const LARGEST_RADIUS = MAX_RADIUS + RADIUS_EXPAND
const LARGEST_DIAMETER = LARGEST_RADIUS * 2
const MAX_STROKE = 10 // stroke thickiness for largest circle
const HOVER_STROKE = 30 // actual stroke for when hovered
const MAX_BUBBLES = 35

jQuery(function() {

    freezeObjects()
    initPIXI()
    
    const app = new Application()

    function freezeObjects()
    {
        if (typeof Object.freeze !== 'function')
        {
            throw new Error('Missing Object.freeze')
        }
        Object.freeze(Bubble.prototype)
        Object.freeze(BubbleAnimation.prototype)
    }

    function initPIXI()
    {
        let type = 'WebGL'
        
        if (!PIXI.utils.isWebGLSupported())
            type = 'canvas'
        
        PIXI.utils.sayHello(type)
    }    
})