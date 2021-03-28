class BubbleAnimation
{
    constructor(bubble)
    {
        this.bubble = bubble
        this.initialRadius = bubble.radius
        this.expanding = false
        this.percentOfFullSize = 0
    }

    update(deltaTime)
    {
        // lots of math DONT TOUCH THIS
        this.bubble.radius = Math.min(
            Math.max(this.bubble.radius + (this.expanding ? 1 : -1) * deltaTime * FRAME_LEN * 50, this.initialRadius),
            this.initialRadius + 10)
        this.percentOfFullSize = (this.bubble.radius - this.initialRadius) / RADIUS_EXPAND
        const apparentRadius = this.bubble.radius + (this.bubble.radius - this.initialRadius) * 5
        this.bubble.border.hitArea.radius = this.bubble.radius * LARGEST_RADIUS / apparentRadius
        this.bubble.border.width = this.bubble.border.height = apparentRadius * 2
        const stroke = lerp(MAX_STROKE * (apparentRadius / (MAX_RADIUS + RADIUS_EXPAND)), HOVER_STROKE, this.percentOfFullSize)
        this.bubble.imgSprite.scale.set((apparentRadius - stroke) / apparentRadius)

        if (this.percentOfFullSize == 0)
        {
            this.bubble.bubbleContainer.zIndex = 0
            this.bubble.destroyLabels()
        }
        else
        {
            const offset = this.expanding ? this.percentOfFullSize - 1 : 1 - this.percentOfFullSize
            this.bubble.redefineLabelCurve(true, apparentRadius - stroke / 2, this.percentOfFullSize, offset)
            this.bubble.redefineLabelCurve(false, apparentRadius - stroke / 2, this.percentOfFullSize, offset)
        }
    }
}