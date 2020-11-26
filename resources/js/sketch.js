const FPS = 60,
    FRAME_LEN = 1 / FPS;
const INTRO_BUBBLE_EVERY_N_FRAME = 4;
const RESTITUTION = 0.1;

const MAX_RADIUS = 100;
const RADIUS_EXPAND = 10; // how much physical circle expands when hovered
const MAX_STROKE = 10; // stroke thickiness for largest circle
const HOVER_STROKE = 30; // actual stroke for when hovered
const MAX_BUBBLES = 55;
const SLOWDOWN_AFTER_N_FRAMES = Math.floor(MAX_BUBBLES / 20) * FPS;

let gravity;
let velocityFactor; // to prevent bubbles continuously moving after clumping together
let velocityDecreaseRate = 0.99995;

let bubbleCanvas;
let bubbleQueue = [];
let bubbles = [];
let font;
let bubbleGrabbed = false;
let mouseDragging = false;
let wasClickAction = false;
let circleMask;
let buffer;
let finalBubbleAmt;
let rankings;

function setup()
{
    circleMask = createGraphics(200, 200);
    circleMask.circle(100, 100, 200);

    createBubbles();
    
    gravity = windowHeight;
    velocityFactor = 1.0;

    bubbleCanvas = createCanvas(windowWidth, windowHeight);
    bubbleCanvas.parent('bubble-area');

    frameRate(FPS);
    buffer = createGraphics(windowWidth, windowHeight);
    buffer.textAlign(CENTER, BASELINE);
    buffer.imageMode(CENTER);
}

function draw()
{
    if (finalBubbleAmt && bubbleQueue.length != finalBubbleAmt) 
        return;
    update();
    render();
    wasClickAction = false;
}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
    buffer = createGraphics(windowWidth, windowHeight);
    buffer.textAlign(CENTER, BASELINE);
    buffer.imageMode(CENTER);
    gravity = windowHeight;
}

function mouseReleased()
{
    if (!mouseDragging) wasClickAction = true;
    bubbleGrabbed = false;
    mouseDragging = false;
}

function mouseDragged()
{
    mouseDragging = true;
}