/**
 * 
 * @typedef {Object} options
 * @property {string} topStr
 * @property {string} bottomStr
 * @property {string} textureID
 * @property {string} radius
 * @property {string} x
 * @property {string} y
 * @property {string} textColor
 * @property {string} borderColor
 * @property {string} url
 * @property {string} relativeScale
 * @property {string} context
 */

 /**
  * 
  * @param {options} options 
  */
function Bubble(options)
{
    const self = this
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
        self.border = new AnchoredCircle(LARGEST_RADIUS, options.borderColor)
    
        self.imgSprite = createImgSprite()
        self.imgSprite.position.set(LARGEST_RADIUS, LARGEST_RADIUS)
        self.imgSprite.anchor.set(0.5)
        self.border.setRadius(self.radius)
        self.border.setPosition(options.x, options.y)

        const borderSprite = self.border.circle
        borderSprite.hitArea = new PIXI.Circle(LARGEST_RADIUS, LARGEST_RADIUS, LARGEST_RADIUS)
        borderSprite.addChild(self.imgSprite)
        borderSprite.interactive = true
        borderSprite.buttonMode = true
        attachEventListeners(borderSprite)
    
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

    function attachEventListeners(bubbleSprite)
    {
        bubbleSprite
            .on('pointerover', () => {
                // pointerover/mouseover fires on touch screen laptop on last mouse pos,
                // even if touch was the last interaction
                // so check if last interaction was a mouse type
                if (self.context.lastCursor.isMouse)
                    self.hovered()
            })
            .on('pointerdown', evnt => self.press(evnt))
            .on('pointerup', evnt => self.pointerUp(evnt))
            .on('pointerupoutside', () => self.exit())
            .on('pointerout', () => self.exit())
            .on('pointercancel', () => self.exit())
            .on('pointermove', evnt => self.pointerMoved(evnt))
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

/**
 * @return {Vector}
 */
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
    this.animation.update(dt)

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
}

Bubble.prototype.destroy = function()
{
    this.border.circle.destroy(true)
}
