function Bubble(renderOpt, app)
{
    let _this = this
    // instantiate visual elements ie label, picture
    this.topStr = trimMaxLength(renderOpt.topStr, 18)
    this.bottomStr = trimMaxLength(renderOpt.bottomStr, 18)
    this.radius = renderOpt.radius
    this.textColor = renderOpt.textColor
    this.borderColor = renderOpt.borderColor
    this.relativeScale = renderOpt.relativeScale

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
        const radius = _this.radius        
    
        const circle = createCircleGraphic(LARGEST_RADIUS, renderOpt.borderColor)
        _this.border = new PIXI.Sprite(app.renderer.generateTexture(circle))
        _this.border.anchor.set(0.5)
        _this.border.hitArea = new PIXI.Circle(0, 0, LARGEST_RADIUS)
    
        _this.imgSprite = createImgSprite()
        _this.imgSprite.anchor.set(0.5)
        _this.border.addChild(_this.imgSprite)
        _this.border.width = _this.border.height = radius * 2
        _this.border.position.set(renderOpt.x, renderOpt.y)
        _this.border.interactive = true
        _this.border.buttonMode = true
    
        _this.border
            .on('pointerover', () => _this.hover())
            .on('pointerout', () => _this.exit())
        app.stage.addChild(_this.border)
    }

    function createImgSprite()
    {
        const circle = createCircleGraphic(LARGEST_RADIUS, 0xfeeae0),
            resource = PIXI.Loader.shared.resources[renderOpt.textureID]

        if (resource)
        {
            const texture = resource.texture,
                buffer = new PIXI.Sprite(texture)

            buffer.mask = circle
            buffer.scale.set(LARGEST_DIAMETER / texture.width)
            
            const croppedScaledTex = app.renderer.generateTexture(
                buffer, PIXI.SCALE_MODES.LINEAR, 1, new PIXI.Rectangle(0, 0, LARGEST_DIAMETER, LARGEST_DIAMETER)
            )

            return new PIXI.Sprite(croppedScaledTex)
        }
        return new PIXI.Sprite(app.renderer.generateTexture(circle))
    }

    function createCircleGraphic(radius, color)
    {
        const circle = new PIXI.Graphics()
        circle.beginFill(color)
        circle.drawCircle(radius, radius, radius)
        circle.endFill()
        return circle
    }
}

Bubble.prototype.hover = function() 
{
    this.animation.expanding = true
    this.border.zIndex = 2
    // this.imgSprite.scale.set(1.3)
    // this.radius = this.constRadius * 1.3
}

Bubble.prototype.exit = function() 
{
    this.animation.expanding = false
    this.border.zIndex = 1
    // this.imgSprite.scale.set(1)
    // this.radius = this.constRadius
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
    if (!this.dragged)
    {
        this.velocity = this.velocity.add(getGravVector(this.border.position).mult(FRAME_LEN * dt))
        // if it's offscreen, disregard velocityFactor slowdown to give it an opportunity to enter screenspace
        if (onScreen(this.border.position, 0))
            this.velocity = this.velocity.mult(velocityFactor)
        const { x, y } = this.velocity

        this.border.x += x
        this.border.y += y
    }
    else
        this.imgSprite.position.set(mouseX, mouseY)

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
    this.bubble.border.hitArea = new PIXI.Circle(0, 0, this.bubble.radius * LARGEST_RADIUS / apparentRadius)
    this.bubble.border.width = this.bubble.border.height = apparentRadius * 2
    const stroke = lerp(MAX_STROKE * (apparentRadius / (MAX_RADIUS + RADIUS_EXPAND)), HOVER_STROKE, this.percentOfFullSize())
    this.bubble.imgSprite.scale.set((apparentRadius - stroke) / apparentRadius)
    if (this.percentOfFullSize() == 0)
        this.bubble.border.zIndex = 0
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
