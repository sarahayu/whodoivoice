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
const MAX_BUBBLES = 75

let engineInitialize


// That's default v4 vertex shader, just in case
const myVertex = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void) {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}
`;

const myFragment = `
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 inputSize;
uniform vec4 outputFrame;
uniform vec2 shadowDirection;
uniform float floorY;

void main(void) {
    //1. get the screen coordinate
    vec2 screenCoord = vTextureCoord * inputSize.xy + outputFrame.xy;
    //2. calculate Y shift of our dimension vector
    vec2 shadow;
    //shadow coordinate system is a bit skewed, but it has to be the same for screenCoord.y = floorY
    float paramY = (screenCoord.y - floorY) / shadowDirection.y;
    shadow.y = paramY + floorY;
    shadow.x = screenCoord.x + paramY * shadowDirection.x;
    vec2 bodyFilterCoord = (shadow - outputFrame.xy) * inputSize.zw; // same as / inputSize.xy

    vec4 originalColor = texture2D(uSampler, vTextureCoord);
    vec4 shadowColor;

    float radius = 8.0 / inputSize.x;
    float offset = 2.0 / inputSize.x;

    for (float x = -1.0; x <= 1.0; x += 0.25)
        for (float y = -1.0; y <= 1.0; y += 0.25)
        {
            vec4 shadowColorPoint = texture2D(uSampler, vTextureCoord + vec2(offset + x * radius, offset + y * radius * inputSize.x / inputSize.y));
            shadowColorPoint.rgb = vec3(0.0);
            shadowColor += shadowColorPoint;
        }
    shadowColor /= 81.0;
    shadowColor.a *= 0.5;

    // normal blend mode coefficients (1, 1-src_alpha)
    // shadow is destination (backdrop), original is source
    gl_FragColor = originalColor + shadowColor * (1.0 - originalColor.a);
}
`;

jQuery(function() {

    freezeObjects()
    initPIXI()

    const app = new Application()

    engineInitialize = function(malID)
    {
        app.init(malID)
    }

    engineInitialize(6686)

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