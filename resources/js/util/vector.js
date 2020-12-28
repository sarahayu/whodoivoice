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

{
    const _proto = Vector.prototype

    _proto.set = function(x, y)
    {
        this.x = x
        this.y = y
    }
    
    _proto.distSq = function(other)
    {
        return other.sub(this).magSq()
    }
    
    _proto.sub = function(other)
    {
        return new Vector(this.x - other.x, this.y - other.y)
    }
    
    _proto.add = function(other)
    {
        return new Vector(this.x + other.x, this.y + other.y)
    }
    
    _proto.mult = function(scale)
    {
        return new Vector(this.x * scale, this.y * scale)
    }
    
    _proto.div = function(scale)
    {
        return this.mult(1 / scale)
    }
    
    _proto.magSq = function()
    {
        return this.x * this.x + this.y * this.y
    }
    
    _proto.normalize = function()
    {
        const mag = Math.sqrt(this.magSq())
        return new Vector(this.x / mag, this.y / mag)
    }
    
    _proto.dot = function(other)
    {
        return this.x * other.x + this.y * other.y
    }
}