/**
 * a class for Graphics object that can be anchored
 * @class 
 * @param {number} radius 
 * @param {number} color
 */
function AnchoredCircle(radius, color)
{
    this.circle = new PIXI.Graphics()
    this.circle.beginFill(color)
    this.circle.drawCircle(radius, radius, radius)
    this.circle.endFill()

    // save radius to variable to minimize calls to circle.width (which slows down PIXI)
    this._radius = radius
    this._position = new Vector(0, 0)
}

/**
 * @param {number} radius 
 */
AnchoredCircle.prototype.setRadius = function(radius)
{
    if (this._radius === radius)
        return

    const { x, y } = this.getPosition()
    this.circle.width = this.circle.height = radius * 2
    this._radius = radius
    this.setPosition(x, y) // reset position to account for scale change
}

/**
 * @return {number}
 */
AnchoredCircle.prototype.getRadius = function()
{
    return this._radius
}

/**
 * @param {number} x 
 * @param {number} y 
 */
AnchoredCircle.prototype.setPosition = function(x, y)
{
    this._position.set(x, y)
    this.circle.position.set(x - this._radius, y - this._radius)
}

/**
 * @return {Vector}
 */
AnchoredCircle.prototype.getPosition = function()
{
    return this._position
}

/**
 * @param {number} dx 
 * @param {number} dy 
 */
AnchoredCircle.prototype.move = function(dx, dy)
{
    const { x, y } = this._position
    this.setPosition(x + dx, y + dy)
}