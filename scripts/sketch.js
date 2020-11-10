const FPS = 60,
    FRAME_LEN = 1 / FPS;
const INTRO_BUBBLE_EVERY_N_FRAME = 4;
const RESTITUTION = 0.1;

const MAX_RADIUS = 100;
const RADIUS_EXPAND = 10; // how much physical circle expands when hovered
const MAX_STROKE = 10; // stroke thickiness for largest circle
const HOVER_STROKE = 30; // actual stroke for when hovered
const MAX_BUBBLES = 50;

let gravity;
let velocityFactor; // to prevent bubbles continuously moving after clumping together
let velocityDecreaseRate = 0.99995;

let frame = 0;
let bubbleCanvas;
let bubbleQueue = [];
let bubbles = [];
let font;
let bubbleGrabbed = false;
let circleMask;
let buffer;

function getOffscreenPoint()
{
    let point;
    do {
        point = createVector(Math.random() * (windowWidth + 1000) - 500, Math.random() * (windowHeight + 1000) - 500);
    }
    while (onScreen(point, 100));
    return point;
}

function onScreen(point, border)
{
    return point.x >= -border && point.x <= windowWidth + border &&
        point.y >= -border && point.y <= windowHeight + border;
}

function getGravVector(curLoc)
{
    let gravVector;
    if (windowWidth > windowHeight)
    {
        const halfHeight = windowHeight / 2;
        let leftPoint = createVector(halfHeight, halfHeight),
            rightPoint = createVector(windowWidth - halfHeight, halfHeight);

        if (curLoc.x >= leftPoint.x && curLoc.x <= rightPoint.x)
            gravVector = createVector(0, halfHeight - curLoc.y);
        else
            gravVector = p5.Vector.sub((curLoc.x > rightPoint.x) ? rightPoint : leftPoint, curLoc);
    }
    else
    {
        const halfWidth = windowHeight / 2;
        let topPoint = createVector(halfWidth, halfWidth),
            bottomPoint = createVector(windowHeight - halfWidth, halfWidth);

        if (curLoc.y <= topPoint.y && curLoc.y >= bottomPoint.y)
            gravVector = createVector(0, halfWidth - curLoc.x);
        else
            gravVector = p5.Vector.sub((curLoc.y > bottomPoint.y) ? bottomPoint : topPoint, curLoc);
    }

    gravVector.normalize();
    gravVector.mult(FRAME_LEN * 1000);
    return gravVector;
}

function drawCurvedText(str, radius, scale, x, y, offset, color, ctx)
{
    ctx.textFont('Courier New', scale);

    let arcLength = 0;
    let totalAngle = ctx.textWidth(str) / radius;

    for (let i = 0; i < str.length; i++)
    {
        let currentChar = str.charAt(i);
        let w = ctx.textWidth(currentChar);

        arcLength += w / 2;
        let theta = arcLength / radius - totalAngle / 2 + offset;

        ctx.push();
        ctx.fill(color);
        ctx.translate(x, y);
        ctx.rotate(theta);
        ctx.translate(0, -radius);
        ctx.text(currentChar, 0, 0);
        ctx.pop();

        arcLength += w / 2;
    }
}

function preload()
{
    circleMask = createGraphics(200, 200);
    circleMask.circle(100, 100, 200);

    for (let i = 0; i < MAX_BUBBLES; i++)
        (function (j)
        {
            loadImage(`https://picsum.photos/${Math.floor(Math.random() * 300) + 100}`, img =>
            {
                let offscreen = getOffscreenPoint();
                bubbleQueue.push(new Bubble(Math.pow((MAX_BUBBLES - j) / MAX_BUBBLES, 2) * 60 + 40, offscreen.x, offscreen.y, img));
            })
        })(i);
}

function setup()
{
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
    background('#DADADA');

    velocityFactor = max(velocityFactor *= velocityDecreaseRate, 0.2);

    if (bubbleQueue.length != bubbles.length)
    {
        if (frame % INTRO_BUBBLE_EVERY_N_FRAME == 0)
        {
            bubbles.push(bubbleQueue[bubbles.length]);
            bubbles.sort((first, second) =>
            {
                return second.radius - first.radius;
            });
        }
        frame++;
    }
    // have velocity decrease at a faster rate once bubbles have settled down
    else if (frame == INTRO_BUBBLE_EVERY_N_FRAME * bubbleQueue.length - INTRO_BUBBLE_EVERY_N_FRAME + 1)
    {
        console.log('Slowing down now');
        frame++;
        setTimeout(() =>
        {
            velocityDecreaseRate = 0.998;
        }, 2000);
    }

    cursor(ARROW);

    for (const bubble of bubbles)
        bubble.update();
    for (const bubble1 of bubbles)
        for (const bubble2 of bubbles)
            if (bubble1 != bubble2)
                resolveCollision(bubble1, bubble2);

    buffer.clear();

    // used to order rendering, which is:
    // 1. non-expanding, background bubbles
    // 2. bubbles with text
    // 3. expanding, grabbed bubble
    let expandingBubble;
    let bubblesWithText = [];

    for (const bubble of bubbles)
    {
        if (bubble.animation.expanding)
            expandingBubble = bubble;
        else if (bubble.animation.radius != bubble.animation.constRadius)
            bubblesWithText.push(bubble);
        else
            bubble.draw(buffer, true);
    }

    push();
    drawingContext.shadowOffsetX = 2;
    drawingContext.shadowOffsetY = 2;
    drawingContext.shadowBlur = 8;
    drawingContext.shadowColor = 'rgba(0,0,0,0.5)';
    image(buffer, 0, 0);
    pop();
    //buffer.clear();

    push();

    textAlign(CENTER, BASELINE);
    imageMode(CENTER);
    for (const bubble of bubblesWithText)
    {
        bubble.draw(this, false);
        bubble.drawLabel(this);
    }

    if (expandingBubble)
    {
        expandingBubble.draw(this, false);
        expandingBubble.drawLabel(this);
    }
    pop();

    //image(buffer, 0, 0);
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
