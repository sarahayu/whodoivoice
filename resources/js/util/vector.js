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