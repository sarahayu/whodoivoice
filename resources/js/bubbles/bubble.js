class Bubble
{
    constructor(options)
    {
        const self = this
        // instantiate visual elements ie label, picture
        this.topStr = trimMaxLength(options.topStr, 18)
        this.bottomStr = trimMaxLength(options.bottomStr, 18)
        this.radius = options.radius
        this.textColor = options.textColor
        this.context = options.context

        createBubbleSprite()

        // instantiate physics properties
        this.mass = options.radius * 1000
        this.invMass = 1 / this.mass
        this.position = options.position
        this.velocity = new PIXI.Point(0, 0)

        // instantiate animation props and mouse interaction stuff
        this.animation = new BubbleAnimation(this)
        this.dragged = false
        this.url = options.url
        this.state = BubbleState.DORMANT
        this.topLabel = {}
        this.bottomLabel = {}

        this.animation.update(0)

        function createBubbleSprite()
        {
            self.border = createCircleGraphic(LARGEST_RADIUS, options.borderColor, 0, 0)

            self.imgSprite = createImgSprite()
            self.imgSprite.anchor.set(0.5)

            self.border.width = self.border.height = self.radius * 2

            self.border.hitArea = new PIXI.Circle(0, 0, LARGEST_RADIUS)
            self.border.addChild(self.imgSprite)
            self.border.interactive = true
            self.border.buttonMode = true

            attachEventListeners(self.border)

            self.bubbleContainer = new PIXI.Container()
            self.bubbleContainer.addChild(self.border)
            self.bubbleContainer.position.set(options.position.x, options.position.y)

            options.context.bubbleStage.addChild(self.bubbleContainer)
        }

        function createImgSprite()
        {
            const circle = createCircleGraphic(LARGEST_RADIUS, 0xfeeae0, 0, 0),
                resource = PIXI.Loader.shared.resources[options.textureID],
                // resource = PIXI.Loader.shared.resources.splash,
                resolution = options.relativeScale > 0.6 ? 2 : 1

            if (resource)
            {
                const texture = resource.texture,
                    buffer = new PIXI.Sprite(texture)

                buffer.mask = circle
                buffer.anchor.set(0.5, 0.5 * texture.width / texture.height)
                buffer.scale.set(LARGEST_DIAMETER / texture.width)

                const croppedScaledTex = options.context.app.renderer.generateTexture(
                    buffer, PIXI.SCALE_MODES.LINEAR, resolution, new PIXI.Rectangle(-LARGEST_RADIUS, -LARGEST_RADIUS, LARGEST_DIAMETER, LARGEST_DIAMETER)
                )

                return new PIXI.Sprite(croppedScaledTex)
            }
            return new PIXI.Sprite(options.context.app.renderer.generateTexture(
                circle, PIXI.SCALE_MODES.LINEAR, resolution
            ))
        }

        function createCircleGraphic(radius, color, x, y)
        {
            return new PIXI.Graphics()
                .beginFill(color)
                .drawCircle(x, y, radius)
                .endFill()
        }

        function attachEventListeners(bubbleSprite)
        {
            bubbleSprite
                .on('pointerover', evnt => self.hover(evnt))
                .on('pointerdown', evnt => {
                    // can't simply call stopPropagation because body's pointerdown is used to detect pointertype
                    // and we can't cancel it. Instead, we keep boolean in shared context
                    self.context.bubblePointerDownCalled.value = true
                    self.press(evnt)
                })
                .on('pointerup', evnt => self.pointerUp(evnt))
                .on('pointerupoutside', () => self.exit())
                .on('pointerout', () => self.exit())
                .on('pointercancel', () => self.exit())
                .on('pointermove', evnt => self.pointerMoved(evnt))
        }
    }

    expand(evnt)
    {
        const activeBubble = this.context.activeBubble.value

        if (activeBubble)
        {
            // other bubble is currently being dragged, even though 
            // cursor might have temporarily hovered over this bubble
            if (activeBubble.state === BubbleState.DRAGGING)
                return
            activeBubble.exit()
        }
        this.context.activeBubble.value = this
        
        this.animation.expanding = true
        this.bubbleContainer.zIndex = 2

        if (!this.topLabel.textRope)
        {
            this.attachText(this.topLabel, this.topStr, 1, 'normal')
            this.attachText(this.bottomLabel, this.bottomStr, -1, 'bold')
        }
    }

    hover(evnt)
    {
        if (
            /* this is for making sure bubbles don't expand when floating over 
            last mouse pos when user is using touch screen currently
            (users such as myself) */
            !this.context.lastCursor.isMouse 
            || this.context.activeBubble.value === this
            /* hovered on another bubble as mouse was dragging, ignore */
            || (this.context.activeBubble.value && this.context.activeBubble.value.state == BubbleState.DRAGGING))
            return
        this.expand(evnt)
        this.state = BubbleState.HOVERED
    }
    
    press(evnt)
    {
        // TODO still have to figure out how to prevent multitouch
        if (!evnt.data.isPrimary)
            return

        this.bubbleContainer.data = evnt.data

        if (this.state === BubbleState.DORMANT)
            this.expand(evnt)

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

    pointerUp(evnt)
    {
        if (this.context.activeBubble.value !== this)
            return

        if (this.state === BubbleState.DRAGGING)
        {
            this.bubbleContainer.data = null
            this.state = BubbleState.HOVERED
        }
        else if (this.state === BubbleState.CLICKED)
            window.open(this.url, '_blank')

        if (evnt.data.pointerType !== 'mouse')
        {
            this.state = BubbleState.HOVERED
        }

        this.context.lastCursor.pointerId = null
    }

    pointerMoved(evnt)
    {
        if (this.context.activeBubble.value !== this)
            return

        if (this.lastPointerPos)
        {
            const curPos = evnt.data.getLocalPosition(this.bubbleContainer.parent),
                distSq = vm_distSq(this.lastPointerPos, curPos)
            this.lastPointerPos = curPos

            if (distSq < 5) return
        }
        else
            this.lastPointerPos = evnt.data.getLocalPosition(this.bubbleContainer.parent)

        // either the user has clicked and moved, 
        // or the user is holding down touch and dragging
        if (this.state === BubbleState.CLICKED
            || (evnt.data.pointerType !== 'mouse' && this.state === BubbleState.HOVERED))
            this.state = BubbleState.DRAGGING
        this.bubbleContainer.data = evnt.data
    }

    exit(forceExit)
    {
        if (forceExit || (this.state !== BubbleState.DRAGGING && this.context.activeBubble.value === this))
        {
            this.context.activeBubble.value = null
            this.state = BubbleState.DORMANT
            this.animation.expanding = false
            this.bubbleContainer.zIndex = 1
        }
    }

    destroyLabels()
    {
        if (this.topLabel.textRope)
            this.destroyLabel(this.topLabel)
        if (this.bottomLabel.textRope)
            this.destroyLabel(this.bottomLabel)

        this.topLabel = {}
        this.bottomLabel = {}
    }

    destroyLabel(label)
    {
        label.textRope.destroy(true)
        this.bubbleContainer.removeChild(label.textRope)
        label.textRope = null
        label.text = null
    }

    getPosition()
    {
        return this.bubbleContainer.position
    }

    setPosition(x, y)
    {
        if (typeof x !== 'number')
        {
            y = x.y
            x = x.x
        }

        this.bubbleContainer.position.set(x, y)
    }

    move(dx, dy)
    {
        if (typeof dx !== 'number')
        {
            dy = dx.y
            dx = dx.x
        }

        const { x, y } = this.getPosition()
        this.bubbleContainer.position.set(x + dx, y + dy)
    }

    update(dt, velocityFactor)
    {
        if (this.state !== BubbleState.DORMANT || this.animation.percentOfFullSize != 0)
            this.animation.update(dt)

        

        if (this.state !== BubbleState.DRAGGING)
        {
            this.velocity = vm_add(this.velocity, vm_mult(getGravVector(this.getPosition()), FRAME_LEN * dt))
            // if it's offscreen, disregard velocityFactor slowdown to give it an opportunity to enter screenspace
            if (onScreen(this.getPosition(), 0))
                this.velocity = vm_mult(this.velocity, velocityFactor)
            this.move(this.velocity)
        }
        else
            this.setPosition(this.bubbleContainer.data.getLocalPosition(this.bubbleContainer.parent))
    }

    attachText(label, str, stepFactor, bold)
    {
        if (!str) return

        label.text = new PIXI.Text(str, {
            fontFamily: 'Courier New',
            fill: this.textColor,
            fontWeight: bold,
            fontSize: 22
        })
        label.text.updateText()

        label.points = []

        defineCurvePoints(label.points, this.radius * stepFactor, label.text.texture.width, 0)

        label.textRope = new PIXI.SimpleRope(label.text.texture, label.points)

        this.bubbleContainer.addChild(label.textRope)

        /*
        if (!str) return

        this.topLabel = new PIXI.Text(this.topStr, {
            fontFamily: 'Courier New',
            fill: this.textColor
        })
        this.topLabel.updateText()

        this.topLabelPoints = []

        defineCurvePoints(this.topLabelPoints, this.radius, this.topLabel.texture.width)

        this.topLabelStrip = new PIXI.SimpleRope(this.topLabel.texture, this.topLabelPoints)

        this.bubbleContainer.addChild(this.topLabelStrip)*/
    }

    redefineLabelCurve(top, radius, opacity, offset)
    {
        if (top && this.topLabel.textRope)
        {
            this.topLabel.textRope.alpha = opacity
            defineCurvePoints(this.topLabel.points, radius, this.topLabel.text.texture.width, offset)
        }
        else if (!top && this.bottomLabel.textRope)
        {
            this.bottomLabel.textRope.alpha = opacity
            defineCurvePoints(this.bottomLabel.points, radius * -1, this.bottomLabel.text.texture.width, offset)
        }
    }

    destroy()
    {
        this.bubbleContainer.destroy(true)
    }
}

const BubbleState = Object.freeze({
    HOVERED: 1,
    CLICKED: 2,
    DRAGGING: 3,
    DORMANT: 4
})