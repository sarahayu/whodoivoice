function Bubble(options)
{
    let _this = this
    // instantiate visual elements ie label, picture
    this.topStr = trimMaxLength(options.topStr, 18)
    this.bottomStr = trimMaxLength(options.bottomStr, 18)
    this.radius = options.radius
    this.textColor = options.textColor
    this.borderColor = options.borderColor
    this.relativeScale = options.relativeScale
    this.context = options.context

    createBubbleSprite()

    // instantiate physics properties
    this.mass = options.radius * 1000
    this.invMass = 1 / this.mass
    this.location = new Vector(options.x, options.y)
    this.velocity = new Vector(0, 0)

    // instantiate animation props and mouse interaction stuff
    this.animation = new BubbleAnimation(this)
    this.dragged = false
    this.url = options.url
    this.state = BubbleState.DORMANT

    function createBubbleSprite()
    {
        _this.border = new AnchoredCircle(LARGEST_RADIUS, options.borderColor)
    
        _this.imgSprite = createImgSprite()
        _this.imgSprite.position.set(LARGEST_RADIUS, LARGEST_RADIUS)
        _this.imgSprite.anchor.set(0.5)
        _this.border.setRadius(_this.radius)
        _this.border.setPosition(options.x, options.y)

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
                if (_this.context.lastCursor.isMouse)
                    _this.hovered()
            })
            .on('pointerdown', evnt => _this.press(evnt))
            .on('pointerup', evnt => _this.pointerUp(evnt))
            .on('pointerupoutside', () => _this.exit())
            .on('pointerout', () => _this.exit())
            .on('pointercancel', () => _this.exit())
            .on('pointermove', evnt => _this.pointerMoved(evnt))
        options.context.app.stage.addChild(borderSprite)
    }

    function createImgSprite()
    {
        const circle = new AnchoredCircle(LARGEST_RADIUS, 0xfeeae0),
            // resource = PIXI.Loader.shared.resources[options.textureID]
            resource = PIXI.Loader.shared.resources.splash

        if (resource)
        {
            const texture = resource.texture,
                buffer = new PIXI.Sprite(texture)

            buffer.mask = circle.circle
            buffer.scale.set(LARGEST_DIAMETER / texture.width)
            
            const croppedScaledTex = options.context.app.renderer.generateTexture(
                buffer, PIXI.SCALE_MODES.LINEAR, 1, new PIXI.Rectangle(0, 0, LARGEST_DIAMETER, LARGEST_DIAMETER)
            )

            return new PIXI.Sprite(croppedScaledTex)
        }
        return new PIXI.Sprite(context.app.renderer.generateTexture(circle.circle))
    }
}

const BubbleState = Object.freeze({
    HOVERED: 1,
    CLICKED: 2,
    DRAGGING: 3,
    DORMANT: 4
})

Bubble.prototype.expand = function()
{
    if (this.context.activeBubble != this)
    {
        if (this.context.activeBubble) 
        {
            // other bubble is currently being dragged, even though 
            // cursor might have temporarily hovered over this bubble
            if (this.context.activeBubble.state === BubbleState.DRAGGING) return
            this.context.activeBubble.exit()
        }
        this.context.activeBubble = this
    }

    this.animation.expanding = true
    this.border.circle.zIndex = 2
}

Bubble.prototype.hovered = function()
{
    if (this.state === BubbleState.DORMANT)
    {
        this.expand()
        this.state = BubbleState.HOVERED
    }
}

Bubble.prototype.press = function(evnt) 
{
    this.border.circle.data = evnt.data
    
    if (this.state === BubbleState.DORMANT)
        this.expand()

    if (evnt.data.pointerType === 'mouse')
    {
        this.state = BubbleState.CLICKED
    }
    else
    {
        if (this.state === BubbleState.HOVERED)
            this.state = BubbleState.CLICKED
        else if (this.state === BubbleState.DORMANT)
            this.state = BubbleState.HOVERED
    }
}


Bubble.prototype.pointerUp = function(evnt) 
{
    if (this.state === BubbleState.DRAGGING)
    {
        this.border.circle.data = null
        this.state = BubbleState.HOVERED
    }
    else if (this.state === BubbleState.CLICKED)
        window.open(this.url, '_blank')

    if (evnt.data.pointerType !== 'mouse')
    {
        this.state = BubbleState.HOVERED
    }
}

Bubble.prototype.pointerMoved = function(evnt)
{
    // either the user has clicked and moved, 
    // or the user is holding down touch and dragging
    if (this.state === BubbleState.CLICKED 
        || (evnt.data.pointerType !== 'mouse' && this.state === BubbleState.HOVERED))
        this.state = BubbleState.DRAGGING
    this.border.circle.data = evnt.data
}

Bubble.prototype.exit = function() 
{
    if (this.state === BubbleState.DRAGGING) return
    
    this.state = BubbleState.DORMANT
    this.animation.expanding = false
    this.border.circle.zIndex = 1
}

// Bubble.prototype.deactivate = function()
// {
//     this.context.activeBubble = null
    
//     this.pointerUp()
//     this.exit()
// }

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
    if (this.state !== BubbleState.DRAGGING)
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
