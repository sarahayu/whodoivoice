/*
* using ES6 class for this because Vector has lots of short member methods
* and writing Vector.prototype functions become repetitive
*/

class Vector
{
    constructor(x, y)
    {
        this.set(x, y)
    }

    set(x, y)
    {
        if (typeof x !== 'number')
        {
            y = x.y
            x = x.x
        }
        this.x = x
        this.y = y
    }

    distSq(other)
    {
        return other.sub(this).magSq()
    }

    sub(other)
    {
        return new Vector(this.x - other.x, this.y - other.y)
    }

    add(other)
    {
        return new Vector(this.x + other.x, this.y + other.y)
    }

    mult(scale)
    {
        return new Vector(this.x * scale, this.y * scale)
    }

    div(scale)
    {
        return this.mult(1 / scale)
    }

    magSq()
    {
        return this.x * this.x + this.y * this.y
    }

    normalize()
    {
        const mag = Math.sqrt(this.magSq())
        return new Vector(this.x / mag, this.y / mag)
    }

    dot(other)
    {
        return this.x * other.x + this.y * other.y
    }
}