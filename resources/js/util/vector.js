function Vector(x, y)
{
    if (typeof x === 'number')
    {
        this.x = x
        this.y = y
    }
    else
    {
        this.x = x.x
        this.y = x.y
    }
}

Vector.prototype._square = function() {
    return new Vector(this.x * this.x, this.y * this.y)
}

Vector.prototype.distSq = function(other) {
    return other.sub(this).magSq()
}

Vector.prototype.sub = function(other) {
    return new Vector(this.x - other.x, this.y - other.y)
}

Vector.prototype.add = function(other) {
    return new Vector(this.x + other.x, this.y + other.y)
}

Vector.prototype.mult = function(scale) {
    return new Vector(this.x * scale, this.y * scale)
}

Vector.prototype.div = function(scale) {
    return this.mult(1 / scale)
}

Vector.prototype.magSq = function() {
    return this.x * this.x + this.y * this.y
}

Vector.prototype.normalize = function() {
    const mag = Math.sqrt(this.magSq())
    return new Vector(this.x / mag, this.y / mag)
}

Vector.prototype.dot = function(other) {
    return this.x * other.x + this.y * other.y
}