/*
 * a class for Graphics object that can be anchored
 */
function AnchoredCircle(radius, color)
{
    this.circle = new PIXI.Graphics()
        .beginFill(color)
        .drawCircle(radius, radius, radius)
        .endFill()

    // save radius to variable to minimize calls to circle.width (which slows down PIXI)
    this._radius = radius
    this._position = new Vector(0, 0)
}

AnchoredCircle.prototype.setRadius = function(radius)
{
    if (this._radius === radius)
        return

    const { x, y } = this.getPosition()
    this.circle.width = this.circle.height = radius * 2
    this._radius = radius
    this.setPosition(x, y) // reset position to account for scale change
}

AnchoredCircle.prototype.getRadius = function()
{
    return this._radius
}

AnchoredCircle.prototype.setPosition = function(x, y)
{
    this._position.set(x, y)
    this.circle.position.set(x - this._radius, y - this._radius)
}

AnchoredCircle.prototype.getPosition = function()
{
    return this._position
}

AnchoredCircle.prototype.move = function(dx, dy)
{
    const { x, y } = this._position
    this.setPosition(x + dx, y + dy)
}