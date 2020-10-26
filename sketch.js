const FPS = 60,
    FRAME_LEN = 1 / FPS;
const RESTITUTION = 0.1;
const ACCEL_SLOWDOWN = 0.9; // to prevent bubbles continuously moving after clumping together

let gravity;
let velocityFactor; // to prevent bubbles continuously moving after clumping together

let bubbleCanvas;
let bubbles = [];
let i = 0;

function BubbleAnimation(radius)
{}

function Bubble(radius, locX, locY)
{
    this.radius = radius;
    this.constRadius = radius;
    this.mass = radius * 1000;
    this.invMass = 1 / this.mass;
    this.location = createVector(locX, locY);
    this.velocity = createVector(0, 0);
}

Bubble.prototype.handleHover = function ()
{
    let radSquared = this.radius * this.radius;
    let distSquared = p5.Vector.sub(this.location, createVector(mouseX, mouseY)).magSq();
    if (distSquared <= radSquared &&
        this.radius == this.constRadius)
        this.radius += 10;
    else if (distSquared > radSquared &&
        this.radius != this.constRadius)
        this.radius = this.constRadius;
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

    let percent = 0.2;
    let slop = 0.01;
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
    while (point.x >= 0 && point.x <= windowWidth &&
        point.y >= 0 && point.y <= windowHeight);
    return point;
}

function setup()
{
    gravity = windowHeight;
    velocityFactor = 1.0;

    bubbleCanvas = createCanvas(windowWidth, windowHeight);
    bubbleCanvas.parent('bubble-area');

    background(255);
    frameRate(FPS);
}

function draw()
{
    background(255);
    velocityFactor = max(velocityFactor *= 0.9996, 0.2);

    if (i < 50)
    {
        let offscreen = getOffscreenPoint();
        bubbles.push(new Bubble(Math.pow((50 - i) / 50, 2) * 60 + 40, offscreen.x, offscreen.y));
        i++;
    }
    for (const bubble of bubbles)
    {
        bubble.handleHover();

        let velTowardsCenter = p5.Vector.sub(createVector(windowWidth / 2, windowHeight / 2), bubble.location.copy());
        velTowardsCenter.normalize().mult(FRAME_LEN * 1000);
        bubble.velocity.add(velTowardsCenter);
        bubble.velocity.mult(velocityFactor);
        bubble.location.add(p5.Vector.mult(bubble.velocity, FRAME_LEN));
        //fill(bubble.hasCollided ? color(255, 0, 0) : color(0))
    }

    for (const bubble1 of bubbles)
        for (const bubble2 of bubbles)
        {
            if (bubble1 != bubble2)
            {
                resolveCollision(bubble1, bubble2);
            }
        }

    for (const bubble of bubbles)
        ellipse(bubble.location.x, bubble.location.y, bubble.radius * 2);
}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
    gravity = windowHeight;
}
