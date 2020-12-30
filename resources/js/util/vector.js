/*
* using ES6 class for this because Vector has lots of short member methods
* and writing Vector.prototype functions become repetitive
*/

class Vector
{
    /**
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y)
    {
        this.set(x, y)
    }

    /**
     * @param {Vector} other
     *//**
     * @param {number} x
     * @param {number} y
     */
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

    /**
     * @param {Vector} other
     * @return {Vector}
     */
    distSq(other)
    {
        return other.sub(this).magSq()
    }

    /**
     * @param {Vector} other
     * @return {Vector}
     */
    sub(other)
    {
        return new Vector(this.x - other.x, this.y - other.y)
    }

    /**
     * @param {Vector} other
     * @return {Vector}
     */
    add(other)
    {
        return new Vector(this.x + other.x, this.y + other.y)
    }

    /**
     * @param {number} scale
     * @return {Vector}
     */
    mult(scale)
    {
        return new Vector(this.x * scale, this.y * scale)
    }

    /**
     * @param {number} scale
     * @return {Vector}
     */
    div(scale)
    {
        return this.mult(1 / scale)
    }

    /**
     * @return {Vector}
     */
    magSq()
    {
        return this.x * this.x + this.y * this.y
    }

    /**
     * @return {Vector}
     */
    normalize()
    {
        const mag = Math.sqrt(this.magSq())
        return new Vector(this.x / mag, this.y / mag)
    }

    /**
     * @param {Vector} other
     * @return {Vector}
     */
    dot(other)
    {
        return this.x * other.x + this.y * other.y
    }
}