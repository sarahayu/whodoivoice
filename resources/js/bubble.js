function Bubble(renderOpt)
{
    // instantiate visual elements ie label, picture
    this.topStr = trimMaxLength(renderOpt.topStr, 18);
    this.bottomStr = trimMaxLength(renderOpt.bottomStr, 18);
    this.radius = renderOpt.radius;
    this.constRadius = renderOpt.radius;
    this.textColor = color(renderOpt.textColor);
    this.borderColor = color(renderOpt.borderColor);
    this.relativeScale = renderOpt.relativeScale;
    if (renderOpt.image)
    {
        let image = renderOpt.image;
        let dim = min(image.width, image.height);
        this.image = image.get(0, 0, dim, dim);
        this.image.resize(MAX_RADIUS + RADIUS_EXPAND, MAX_RADIUS + RADIUS_EXPAND);
        this.image.mask(circleMask);
    }

    // instantiate physics properties
    this.mass = renderOpt.radius * 1000;
    this.invMass = 1 / this.mass;
    this.location = createVector(renderOpt.x, renderOpt.y);
    this.velocity = createVector(0, 0);

    // instantiate animation props and mouse interaction stuff
    this.animation = new BubbleAnimation(renderOpt.radius);
    this.dragged = false;
    this.url = renderOpt.url;
}

Bubble.prototype.update = function ()
{
    // update animation stuff
    let hovered = p5.Vector.sub(this.location, createVector(mouseX, mouseY)).magSq() <= this.radius * this.radius;
    if (hovered)
    {
        if (mouseDragging) cursor("grabbing");
        else cursor(HAND);
    }
    this.animation.expanding = (!bubbleGrabbed || this.dragged) && hovered;
    this.animation.update(FRAME_LEN);
    this.radius = this.animation.radius;
    if (!bubbleGrabbed && hovered && mouseDragging)
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

    // did user click on this button?
    if (hovered && wasClickAction && this.animation.percentOfFullSize() > 0.5)
        window.open(this.url, '_blank');
}

Bubble.prototype.drawBatch = function (ctx)
{
    let imgDiameter = this.animation.apparentRadius * 2 - this.animation.stroke * 2;

    // draw white border
    ctx.noStroke();
    ctx.fill(this.borderColor);
    ctx.ellipse(this.location.x, this.location.y, this.animation.apparentRadius * 2);

    // draw inner circle
    if (this.image)
    {
        ctx.image(
            this.image,
            this.location.x,
            this.location.y,
            imgDiameter,
            imgDiameter
        );
    }
    else
    {
        ctx.fill('#FEEAE0');
        ctx.ellipse(this.location.x, this.location.y, this.animation.apparentRadius * 2 - this.animation.stroke * 2);
    }
}

Bubble.prototype.drawWShadow = function (ctx, batch)
{
    let imgDiameter = this.animation.apparentRadius * 2 - this.animation.stroke * 2;

    // draw white border
    ctx.push();
    ctx.noStroke();
    ctx.fill(this.borderColor);
    ctx.drawingContext.shadowOffsetX = 2;
    ctx.drawingContext.shadowOffsetY = 2;
    ctx.drawingContext.shadowBlur = 8;
    ctx.drawingContext.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.ellipse(this.location.x, this.location.y, this.animation.apparentRadius * 2);
    ctx.pop();

    // draw inner circle
    ctx.push();
    ctx.noStroke();
    if (this.image)
    {
        ctx.image(
            this.image,
            this.location.x,
            this.location.y,
            imgDiameter,
            imgDiameter
        );
    }
    else
    {
        ctx.fill('#FEEAE0');
        ctx.ellipse(this.location.x, this.location.y, this.animation.apparentRadius * 2 - this.animation.stroke * 2);
    }
    ctx.pop();
}

Bubble.prototype.drawLabel = function (ctx)
{
    let alphaColor = this.textColor;
    alphaColor.setAlpha(this.animation.percentOfFullSize() * 255);

    let textRenderOpt = {
        str: this.topStr,
        radius: this.animation.apparentRadius - this.animation.stroke + (this.animation.stroke * lerp(0.2, 0.3, 1 - this.relativeScale)),
        scale: lerp(0.7, 0.8, this.relativeScale) * this.animation.stroke,
        x: this.location.x,
        y: this.location.y,
        offset: this.animation.expanding ? this.animation.percentOfFullSize() - 1 : 1 - this.animation.percentOfFullSize(),
        color: alphaColor,
        ctx: ctx
    };

    drawCurvedText(textRenderOpt);

    textRenderOpt.str = this.bottomStr;
    textRenderOpt.radius = -(this.animation.apparentRadius - (this.animation.stroke * lerp(0.2, 0.3, 1 - this.relativeScale)));
    textRenderOpt.style = BOLD;

    drawCurvedText(textRenderOpt);
}

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
        const halfWidth = windowWidth / 2;
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
