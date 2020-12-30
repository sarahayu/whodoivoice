/*
 * use ES6 class for BubbleAnimation because it's a small class
 */
class BubbleAnimation
{
    /**
     * @param {Bubble} bubble 
     */
    constructor(bubble)
    {
        this.bubble = bubble
        this.initialRadius = bubble.radius
        this.expanding = false

        Object.defineProperty(this, 'percentOfFullSize', {
            get: function ()
            {
                return (this.bubble.radius - this.initialRadius) / RADIUS_EXPAND
            }
        })
    }

    update(deltaTime)
    {
        // lots of math DONT TOUCH THIS
        this.bubble.radius = Math.min(
            Math.max(this.bubble.radius + (this.expanding ? 1 : -1) * deltaTime * FRAME_LEN * 50, this.initialRadius),
            this.initialRadius + 10)
        const apparentRadius = this.bubble.radius + (this.bubble.radius - this.initialRadius) * 5
        this.bubble.border.circle.hitArea.radius = this.bubble.radius * LARGEST_RADIUS / apparentRadius
        this.bubble.border.setRadius(apparentRadius)
        const stroke = lerp(MAX_STROKE * (apparentRadius / (MAX_RADIUS + RADIUS_EXPAND)), HOVER_STROKE, this.percentOfFullSize)
        this.bubble.imgSprite.scale.set((apparentRadius - stroke) / apparentRadius)
        if (this.percentOfFullSize == 0)
            this.bubble.border.circle.zIndex = 0
    }
}