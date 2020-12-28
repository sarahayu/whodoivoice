/*
* class for Graphics object that can be anchored to use as circles
*/

function AnchoredCircle(radius, color, x, y)
{
    if (x === void 0) x = y = radius
    this.circle = new PIXI.Graphics()
    this.circle.beginFill(color)
    this.circle.drawCircle(x, y, radius)
    this.circle.endFill()
    
    // save radius to variable to minimize calls to circle.width (which slows down PIXI)
    this._radius = radius
    this._position = new Vector(x, y)
}

AnchoredCircle.prototype.setRadius = function(radius)
{
    if (this._radius === radius) return

    const { x, y } = this.getPosition()
    this.circle.width = this.circle.height = radius * 2
    this._radius = radius
    this.setPosition(x, y)  // reset position to account for scale change
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