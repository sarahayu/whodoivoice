// class Vector
// {
//     constructor(x, y)
//     {
//         this.set(x, y)
//     }

//     set(x, y)
//     {
//         if (typeof x !== 'number')
//         {
//             y = x.y
//             x = x.x
//         }
//         this.x = x
//         this.y = y
//     }

//     distSq(other)
//     {
//         return other.sub(this).magSq()
//     }

//     sub(other)
//     {
//         return new Vector(this.x - other.x, this.y - other.y)
//     }

//     add(other)
//     {
//         return new Vector(this.x + other.x, this.y + other.y)
//     }

//     mult(scale)
//     {
//         return new Vector(this.x * scale, this.y * scale)
//     }

//     div(scale)
//     {
//         return this.mult(1 / scale)
//     }

//     magSq()
//     {
//         return this.x * this.x + this.y * this.y
//     }

//     normalize()
//     {
//         const mag = Math.sqrt(this.magSq())
//         return new Vector(this.x / mag, this.y / mag)
//     }

//     dot(other)
//     {
//         return this.x * other.x + this.y * other.y
//     }
// }

// -------- Vector math -------------- //

function vm_sub(first, x, y)
{
    if (typeof x !== 'number')
    {
        y = x.y
        x = x.x
    }

    return {
        x: first.x - x,
        y: first.y - y
    }
}

function vm_add(first, x, y)
{
    if (typeof x !== 'number')
    {
        y = x.y
        x = x.x
    }

    return {
        x: first.x + x,
        y: first.y + y
    }
}

function vm_mult(vec, scale)
{
    return {
        x: vec.x * scale,
        y: vec.y * scale
    }
}

function vm_div(vec, scale)
{
    return vm_mult(vec, 1 / scale)
}

function vm_magSq(vec)
{
    return vec.x * vec.x + vec.y * vec.y
}

function vm_distSq(first, x, y)
{
    return vm_magSq(vm_sub(first, x, y))
}

function vm_normalize(vec)
{
    const mag = Math.sqrt(vm_magSq(vec))
    return vm_div(vec, mag)
}

function vm_dot(first, x, y)
{
    if (typeof x !== 'number')
    {
        y = x.y
        x = x.x
    }

    return first.x * x + first.y * y
}