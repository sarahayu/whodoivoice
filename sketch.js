const FPS = 60,
    FRAME_LEN = 1 / FPS;
const RESTITUTION = 0.1;

const MAX_RADIUS = 100;
const RADIUS_EXPAND = 10; // how much physical circle expands when hovered
const MAX_STROKE = 10; // stroke thickiness for largest circle
const HOVER_STROKE = 30; // actual stroke for when hovered

let gravity;
let velocityFactor; // to prevent bubbles continuously moving after clumping together
let velocityDecreaseRate = 0.99995;

let frame = 0;
let bubbleCanvas;
let bubbles = [];
let font;
let bubbleGrabbed = false;
let prioritizedBubble; // used to render grabbed bubble in front of all others
let circleMask;

function BubbleAnimation(radius)
{
    this.radius = radius;
    this.apparentRadius = radius;
    this.stroke = 10 * (this.apparentRadius / 100);
    this.constRadius = radius;
    this.expanding = false;
}

BubbleAnimation.prototype.update = function (deltaTime)
{
    this.radius = min(
        max(this.radius + (this.expanding ? 1 : -1) * deltaTime * 50, this.constRadius),
        this.constRadius + 10);
    this.apparentRadius = this.radius + (this.radius - this.constRadius) * 3;
    this.stroke = lerp(MAX_STROKE * (this.apparentRadius / (MAX_RADIUS + RADIUS_EXPAND)), HOVER_STROKE, this.percentOfFullSize());
}

BubbleAnimation.prototype.percentOfFullSize = function ()
{
    return (this.radius - this.constRadius) / RADIUS_EXPAND;
}

function Bubble(radius, locX, locY, image)
{
    this.radius = radius;
    this.constRadius = radius;
    this.mass = radius * 1000;
    this.invMass = 1 / this.mass;
    this.location = createVector(locX, locY);
    this.velocity = createVector(0, 0);
    this.animation = new BubbleAnimation(radius);
    this.dragged = false;
    let dim = min(image.width, image.height);
    this.image = image.get(0, 0, dim, dim);
    this.image.resize(MAX_RADIUS + RADIUS_EXPAND, MAX_RADIUS + RADIUS_EXPAND);
    this.image.mask(circleMask);
}

Bubble.prototype.update = function ()
{
    // update animation stuff
    let hovered = p5.Vector.sub(this.location, createVector(mouseX, mouseY)).magSq() <= this.radius * this.radius;
    if (hovered) cursor(HAND);
    this.animation.expanding = (!bubbleGrabbed || this.dragged) && hovered;
    this.animation.update(FRAME_LEN);
    this.radius = this.animation.radius;
    if (!bubbleGrabbed && hovered && mouseIsPressed)
        this.dragged = bubbleGrabbed = true;
    else if (!bubbleGrabbed)
        this.dragged = false;

    // update physics stuff
    if (!this.dragged)
    {
        this.velocity.add(getGravVector(this.location));
        this.velocity.mult(velocityFactor);
        this.location.add(p5.Vector.mult(this.velocity, FRAME_LEN));
    }
    else
        this.location = createVector(mouseX, mouseY);
}

Bubble.prototype.draw = function ()
{
    // draw white border
    push();
    drawingContext.shadowOffsetX = 2;
    drawingContext.shadowOffsetY = 2;
    drawingContext.shadowBlur = 8;
    drawingContext.shadowColor = 'rgba(0,0,0,0.2)';
    noStroke();
    fill('white');
    ellipse(this.location.x, this.location.y, this.animation.apparentRadius * 2);
    pop();

    // draw inner circle
    push();
    noStroke();
    //fill('#FEEAE0');
    image(this.image, this.location.x, this.location.y, this.animation.apparentRadius * 2 - this.animation.stroke * 2, this.animation.apparentRadius * 2 - this.animation.stroke * 2);
    //ellipse(this.location.x, this.location.y, this.animation.apparentRadius * 2 - this.animation.stroke * 2);
    pop();

    if (this.animation.radius != this.constRadius)
        drawCurvedText('Raiyaaan', this.animation.apparentRadius - this.animation.stroke + (this.animation.stroke * 0.2), this.animation.stroke, this.location.x, this.location.y, this.animation.expanding ? this.animation.percentOfFullSize() - 1 : 1 - this.animation.percentOfFullSize(), `rgba(0,0,0,${this.animation.percentOfFullSize()})`);
}

function resolveCollision(bubble1, bubble2)
{
    let normal = p5.Vector.sub(bubble2.location, bubble1.location);
    let distSquared = normal.magSq(),
        radiusAddedSquared = Math.pow(bubble1.radius + bubble2.radius, 2);

    if (distSquared > radiusAddedSquared)
        return;

    let dist = Math.sqrt(distSquared);
    let radiusAdded = Math.sqrt(radiusAddedSquared);

    if (dist != 0)
    {
        penetration = radiusAdded - dist;
        normal.normalize();
    }
    else
    {
        // Choose random (but consistent) values
        penetration = bubble1.radius;
        normal = createVector(1, 0);
    }

    // Calculate relative velocity
    let rv = p5.Vector.sub(bubble2.velocity, bubble1.velocity);

    // Calculate relative velocity in terms of the normal direction
    let velAlongNormal = rv.dot(normal);

    // Do not resolve if velocities are separating
    if (velAlongNormal > 0)
        return;

    // Calculate impulse scalar
    let j = -(1 + RESTITUTION) * velAlongNormal;
    j /= bubble1.invMass + bubble2.invMass;

    // Apply impulse
    let impulse = p5.Vector.mult(normal, j);
    bubble1.velocity.sub(p5.Vector.div(impulse, bubble1.mass));
    bubble2.velocity.add(p5.Vector.div(impulse, bubble2.mass));

    let percent = 0.6;
    let slop = 0.05;
    let correction = p5.Vector.mult(normal, percent * Math.max(penetration - slop, 0) / (bubble1.invMass + bubble2.invMass));
    bubble1.location.sub(p5.Vector.mult(correction, bubble1.invMass));
    bubble2.location.add(p5.Vector.mult(correction, bubble2.invMass));
}

function getOffscreenPoint()
{
    let point;
    do {
        point = createVector(Math.random() * (windowWidth + 1000) - 500, Math.random() * (windowHeight + 1000) - 500);
    }
    while (point.x >= -100 && point.x <= windowWidth + 100 &&
        point.y >= -100 && point.y <= windowHeight + 100);
    return point;
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

    gravVector.normalize();
    gravVector.mult(FRAME_LEN * 1000);
    return gravVector;
}

function drawCurvedText(str, radius, scale, x, y, offset, color)
{
    textFont('Courier New', scale);

    let arcLength = 0;
    let totalAngle = textWidth(str) / radius;

    for (let i = 0; i < str.length; i++)
    {
        let currentChar = str.charAt(i);
        let w = textWidth(currentChar);

        arcLength += w / 2;
        let theta = arcLength / radius - totalAngle / 2 + offset;

        push();
        fill(color);
        translate(x, y);
        rotate(theta);
        translate(0, -radius);
        text(currentChar, 0, 0);
        pop();

        arcLength += w / 2;
    }
}

function setup()
{
    gravity = windowHeight;
    velocityFactor = 1.0;

    bubbleCanvas = createCanvas(windowWidth, windowHeight);
    bubbleCanvas.parent('bubble-area');

    frameRate(FPS);
    textAlign(CENTER, BASELINE);
    imageMode(CENTER);

    circleMask = createGraphics(200, 200);
    circleMask.circle(100, 100, 200);
}

function draw()
{
    background('#DADADA');

    velocityFactor = max(velocityFactor *= velocityDecreaseRate, 0.2);

    if (frame < 2 * 60)
    {
        if (frame % 2 == 0)
        {
            (function (i)
            {
                loadImage(`https://picsum.photos/${Math.floor(Math.random() * 300) + 100}`, img =>
                {
                    let offscreen = getOffscreenPoint();
                    bubbles.push(new Bubble(Math.pow((60 - i / 2) / 60, 2) * 60 + 40, offscreen.x, offscreen.y, img));
                })
            })(frame);
        }
        frame++;
    }
    // have velocity decrease at a faster rate once bubbles have settled down
    else if (frame == 2 * 60)
    {
        frame++;
        setTimeout(() =>
        {
            velocityDecreaseRate = 0.9995;
        }, 5000);
    }

    cursor(ARROW);

    for (const bubble of bubbles)
        bubble.update();

    for (const bubble1 of bubbles)
        for (const bubble2 of bubbles)
            if (bubble1 != bubble2)
                resolveCollision(bubble1, bubble2);

    for (const bubble of bubbles.slice(0).reverse()) // reverse order we draw so larger bubbles render on top of smaller ones
        if (!bubble.animation.expanding)
            bubble.draw();
        else
            prioritizedBubble = bubble;

    if (prioritizedBubble) prioritizedBubble.draw();
}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
    gravity = windowHeight;
}

function mouseReleased()
{
    bubbleGrabbed = false;
}
