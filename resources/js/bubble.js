function Bubble(renderOpt, context)
{
    let _this = this
    // instantiate visual elements ie label, picture
    this.topStr = trimMaxLength(renderOpt.topStr, 18)
    this.bottomStr = trimMaxLength(renderOpt.bottomStr, 18)
    this.radius = renderOpt.radius
    this.textColor = renderOpt.textColor
    this.borderColor = renderOpt.borderColor
    this.relativeScale = renderOpt.relativeScale
    this.context = context

    createBubbleSprite()

    // instantiate physics properties
    this.mass = renderOpt.radius * 1000
    this.invMass = 1 / this.mass
    this.location = new Vector(renderOpt.x, renderOpt.y)
    this.velocity = new Vector(0, 0)

    // instantiate animation props and mouse interaction stuff
    this.animation = new BubbleAnimation(this)
    this.dragged = false
    this.url = renderOpt.url

    function createBubbleSprite()
    {
        _this.border = new AnchoredCircle(LARGEST_RADIUS, renderOpt.borderColor)
    
        _this.imgSprite = createImgSprite()
        _this.imgSprite.position.set(LARGEST_RADIUS, LARGEST_RADIUS)
        _this.imgSprite.anchor.set(0.5)
        _this.border.setRadius(_this.radius)
        _this.border.setPosition(renderOpt.x, renderOpt.y)

        const borderSprite = _this.border.circle
        borderSprite.hitArea = new PIXI.Circle(LARGEST_RADIUS, LARGEST_RADIUS, LARGEST_RADIUS)
        borderSprite.addChild(_this.imgSprite)
        borderSprite.interactive = true
        borderSprite.buttonMode = true
    
        borderSprite
            .on('pointerover', () => {
                // pointerover/mouseover fires on touch screen laptop on last mouse pos,
                // even if touch was the last interaction
                // so check if last interaction was a mouse type
                if (_this.context.mouseMode.value)
                    _this.expand()
            })
            .on('pointerdown', evnt => _this.press(evnt))
            .on('pointerup', () => _this.release())
            .on('pointerupoutside', () => _this.deactivate())
            .on('pointerout', () => _this.exit())
        context.app.stage.addChild(borderSprite)
    }

    function createImgSprite()
    {
        const circle = new AnchoredCircle(LARGEST_RADIUS, 0xfeeae0),
            // resource = PIXI.Loader.shared.resources[renderOpt.textureID]
            resource = PIXI.Loader.shared.resources.splash

        if (resource)
        {
            const texture = resource.texture,
                buffer = new PIXI.Sprite(texture)

            buffer.mask = circle.circle
            buffer.scale.set(LARGEST_DIAMETER / texture.width)
            
            const croppedScaledTex = context.app.renderer.generateTexture(
                buffer, PIXI.SCALE_MODES.LINEAR, 1, new PIXI.Rectangle(0, 0, LARGEST_DIAMETER, LARGEST_DIAMETER)
            )

            return new PIXI.Sprite(croppedScaledTex)
        }
        return new PIXI.Sprite(context.app.renderer.generateTexture(circle.circle))
    }
}

Bubble.prototype.expand = function()
{
    if (this.context.activeBubble != this)
    {
        if (this.context.activeBubble) 
        {
            // other bubble is currently being dragged, even though 
            // cursor might have temporarily hovered over this bubble
            if (this.context.activeBubble.dragging) return
            this.context.activeBubble.deactivate()
        }
        this.context.activeBubble = this
    }

    this.animation.expanding = true
    this.border.circle.zIndex = 2
}

Bubble.prototype.press = function(evnt) 
{
    this.expand()

    this.border.circle.data = evnt.data
    this.dragging = true


    // if (this.animation.percentOfFullSize() < 0.5)
    //     this.hover()
    // else
    //     window.open(this.url, '_blank')
}


Bubble.prototype.release = function() 
{
    this.dragging = false
    this.border.circle.data = null
}

Bubble.prototype.exit = function() 
{
    if (this.dragging) return
    
    this.animation.expanding = false
    this.border.circle.zIndex = 1
}

Bubble.prototype.deactivate = function()
{
    this.context.activeBubble = null
    
    this.release()
    this.exit()
}

Bubble.prototype.getPosition = function()
{
    return this.border.getPosition()
}

Bubble.prototype.setPosition = function(x, y)
{
    if (typeof x !== 'number')
    {
        y = x.y
        x = x.x
    }

    this.border.setPosition(x, y)
}

Bubble.prototype.move = function(x, y)
{
    if (typeof x !== 'number')
    {
        y = x.y
        x = x.x
    }

    this.border.move(x, y)
}

Bubble.prototype.update = function (dt, velocityFactor)
{

    // // update animation stuff
    // let hovered =  p5.Vector.sub(this.location, new Vector(mouseX, mouseY)).magSq() <= this.radius * this.radius
    // if (hovered)
    // {
    //     if (mouseDragging) cursor("grabbing")
    //     else cursor(HAND)
    // }
    // this.animation.expanding = (!bubbleGrabbed || this.dragged) && hovered
    this.animation.update(dt)
    // this.radius = this.animation.radius
    // if (!bubbleGrabbed && hovered && mouseDragging)
    //     this.dragged = bubbleGrabbed = true
    // else if (!bubbleGrabbed)
    //     this.dragged = false

    // update physics stuff
    if (!this.dragging)
    {
        this.velocity = this.velocity.add(getGravVector(this.getPosition()).mult(FRAME_LEN * dt))
        // if it's offscreen, disregard velocityFactor slowdown to give it an opportunity to enter screenspace
        if (onScreen(this.getPosition(), 0))
            this.velocity = this.velocity.mult(velocityFactor)
        this.move(this.velocity)
    }
    else
    {
        const circle = this.border.circle
        this.setPosition(circle.data.getLocalPosition(circle.parent))
    }

    // // did user click on this button?
    // if (hovered && wasClickAction && this.animation.percentOfFullSize() > 0.5)
    //     window.open(this.url, '_blank')
}

Bubble.prototype.destroy = function()
{
    this.border.destroy(true)
}

function BubbleAnimation(bubble)
{
    this.bubble = bubble
    this.constRadius = bubble.radius
    this.expanding = false
}

BubbleAnimation.prototype.update = function (deltaTime)
{
    // lots of math DONT TOUCH THIS
    this.bubble.radius = Math.min(
        Math.max(this.bubble.radius + (this.expanding ? 1 : -1) * deltaTime * FRAME_LEN * 50, this.constRadius),
        this.constRadius + 10)
    const apparentRadius = this.bubble.radius + (this.bubble.radius - this.constRadius) * 5
    this.bubble.border.circle.hitArea.radius = this.bubble.radius * LARGEST_RADIUS / apparentRadius
    this.bubble.border.setRadius(apparentRadius)
    const stroke = lerp(MAX_STROKE * (apparentRadius / (MAX_RADIUS + RADIUS_EXPAND)), HOVER_STROKE, this.percentOfFullSize())
    this.bubble.imgSprite.scale.set((apparentRadius - stroke) / apparentRadius)
    if (this.percentOfFullSize() == 0)
        this.bubble.border.circle.zIndex = 0
}

BubbleAnimation.prototype.percentOfFullSize = function ()
{
    return (this.bubble.radius - this.constRadius) / RADIUS_EXPAND
}

function getGravVector(curLoc)
{
    let gravVector
    const windowWidth = window.innerWidth, windowHeight = window.innerHeight
    if (windowWidth > windowHeight)
    {
        const halfHeight = windowHeight / 2
        let leftPoint = new Vector(halfHeight, halfHeight),
            rightPoint = new Vector(windowWidth - halfHeight, halfHeight)

        if (curLoc.x >= leftPoint.x && curLoc.x <= rightPoint.x)
            gravVector = new Vector(0, halfHeight - curLoc.y)
        else
            gravVector = ((curLoc.x > rightPoint.x) ? rightPoint : leftPoint).sub(curLoc)
    }
    else
    {
        const halfWidth = windowWidth / 2
        let topPoint = new Vector(halfWidth, halfWidth),
            bottomPoint = new Vector(windowHeight - halfWidth, halfWidth)

        if (curLoc.y <= topPoint.y && curLoc.y >= bottomPoint.y)
            gravVector = new Vector(0, halfWidth - curLoc.x)
        else
            gravVector = ((curLoc.y > bottomPoint.y) ? bottomPoint : topPoint).sub(curLoc)
    }

    return gravVector.normalize().mult(20)
}
