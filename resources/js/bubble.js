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
    this.apparentRadius = this.radius + (this.radius - this.constRadius) * 5;
    this.stroke = lerp(MAX_STROKE * (this.apparentRadius / (MAX_RADIUS + RADIUS_EXPAND)), HOVER_STROKE, this.percentOfFullSize());
}

BubbleAnimation.prototype.percentOfFullSize = function ()
{
    return (this.radius - this.constRadius) / RADIUS_EXPAND;
}

function Bubble(radius, locX, locY, image, relativeScale)
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
    this.relativeScale = relativeScale;
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
        // if it's offscreen, disregard velocityFactor slowdown to give it an opportunity to enter screenspace
        if (onScreen(this.location, 0))
            this.velocity.mult(velocityFactor);
        this.location.add(p5.Vector.mult(this.velocity, FRAME_LEN));
    }
    else
        this.location = createVector(mouseX, mouseY);
}

Bubble.prototype.draw = function (ctx, batch)
{
    if (batch)
    {
        // draw white border
        ctx.noStroke();
        ctx.fill('white');
        ctx.ellipse(this.location.x, this.location.y, this.animation.apparentRadius * 2);

        // draw inner circle
        ctx.image(this.image, this.location.x, this.location.y, this.animation.apparentRadius * 2 - this.animation.stroke * 2, this.animation.apparentRadius * 2 - this.animation.stroke * 2);
    }
    else
    {

        // draw white border
        ctx.push();
        ctx.noStroke();
        ctx.fill('white');
        ctx.drawingContext.shadowOffsetX = 2;
        ctx.drawingContext.shadowOffsetY = 2;
        ctx.drawingContext.shadowBlur = 8;
        ctx.drawingContext.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.ellipse(this.location.x, this.location.y, this.animation.apparentRadius * 2);
        ctx.pop();

        // draw inner circle
        ctx.push();
        ctx.noStroke();
        ctx.noFill();
        ctx.fill('#FEEAE0');
        ctx.ellipse(this.location.x, this.location.y, this.animation.apparentRadius * 2 - this.animation.stroke * 2);
        ctx.image(this.image, this.location.x, this.location.y, this.animation.apparentRadius * 2 - this.animation.stroke * 2, this.animation.apparentRadius * 2 - this.animation.stroke * 2);
        ctx.pop();
    }
}

Bubble.prototype.drawLabel = function (ctx)
{
    drawCurvedText('Momotarou Kabakura',
        this.animation.apparentRadius - this.animation.stroke + (this.animation.stroke * lerp(0.2, 0.3, 1 - this.relativeScale)),
        lerp(0.7, 0.8, this.relativeScale) * this.animation.stroke,
        this.location.x, this.location.y,
        this.animation.expanding ? this.animation.percentOfFullSize() - 1 : 1 - this.animation.percentOfFullSize(), `rgba(0,0,0,${this.animation.percentOfFullSize()})`, ctx);
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

function resolveCollision(bubble1, bubble2)
{
    let normal = p5.Vector.sub(bubble2.location, bubble1.location);
    let distSquared = normal.magSq(),
        radiusAdded = bubble1.radius + bubble2.radius;

    if (distSquared > radiusAdded * radiusAdded)
        return;

    let dist = Math.sqrt(distSquared);

    if (dist != 0)
    {
        penetration = radiusAdded - dist;
        normal.normalize();
    }
    else
    {
        penetration = bubble1.radius;
        normal = createVector(1, 0);
    }

    let rv = p5.Vector.sub(bubble2.velocity, bubble1.velocity);
    let velAlongNormal = rv.dot(normal);

    if (velAlongNormal > 0)
        return;

    let j = -(1 + RESTITUTION) * velAlongNormal;
    j /= bubble1.invMass + bubble2.invMass;

    let impulse = p5.Vector.mult(normal, j);
    bubble1.velocity.sub(p5.Vector.div(impulse, bubble1.mass));
    bubble2.velocity.add(p5.Vector.div(impulse, bubble2.mass));

    let percent = 0.8;
    let slop = 0.06;
    let correction = p5.Vector.mult(normal, percent * Math.max(penetration - slop, 0));
    bubble1.location.sub(p5.Vector.mult(correction, 0.5));
    bubble2.location.add(p5.Vector.mult(correction, 0.5));
}
