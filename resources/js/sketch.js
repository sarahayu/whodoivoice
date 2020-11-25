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
let circleMask;
let buffer;
let finalBubbleAmt;

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
    /* bubbleQueue.sort((first, second) =>
 {
     return first.radius - second.radius;
 });*/
}

function draw()
{
    update();
    render();
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
    bubbleGrabbed = false;
}

function createBubbles()
{
    let createBubble = (characters, offset, img) =>
    {
        let offscreen = getOffscreenPoint(),
            scale = Math.pow((MAX_BUBBLES - offset) / MAX_BUBBLES, 2);
        bubbleQueue.push(new Bubble(characters[offset].name, characters[offset].animeStr, scale * 60 + 40, offscreen.x, offscreen.y, scale, img));
    };

    populateCharacterData((characters) =>
    {
        $("#loading-message").hide().text("Creating bubbles...").fadeIn();
        
        finalBubbleAmt = min(MAX_BUBBLES, characters.length);
        for (let i = 0; i < finalBubbleAmt; i++)
            (function (j)
            {
                if (!characters[j].picURL.includes("questionmark"))
                    loadImage(characters[j].picURL, img =>
                    {
                        createBubble(characters, j, img);
                    });
                else
                    createBubble(characters, j);

            })(i);
    });
    //    $.when(populateCharacterData(characters)).then(() =>
    //    {
    //        console.log("Creating characters", characters.length);
    //        for (let i = 0; i < MAX_BUBBLES; i++)
    //            (function (j)
    //            {
    //                if (!characters[j].picURL.includes("questionmark"))
    //                    loadImage(characters[j].picURL, img =>
    //                    {
    //                        createBubble(j, img);
    //                        console.log("Created character", j);
    //                    });
    //                else
    //                    createBubble(j);
    //
    //            })(i);
    //    });
}
