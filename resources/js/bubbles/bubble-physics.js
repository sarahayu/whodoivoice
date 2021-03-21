function resolveCollisionVelocity(bubble1, bubble2)
{
    let normal = vm_sub(bubble2.getPosition(), bubble1.getPosition())
    const distSquared = vm_magSq(normal)
        radiusAdded = bubble1.radius + bubble2.radius


    if (distSquared > radiusAdded * radiusAdded)
        return

    const dist = Math.sqrt(distSquared)

    if (dist != 0)
    {
        penetration = radiusAdded - dist
        normal = vm_normalize(normal)
    }
    else
    {
        penetration = bubble1.radius
        normal = { x: 1, y: 0 }
    }

    const rv = vm_sub(bubble2.velocity, bubble1.velocity)
    const velAlongNormal = vm_dot(rv, normal)

    if (velAlongNormal > 0)
        return

    const j = -(1 + RESTITUTION) * velAlongNormal / (bubble1.invMass + bubble2.invMass)

    const impulse = vm_mult(normal, j)
    bubble1.velocity = vm_sub(bubble1.velocity, vm_div(impulse, bubble1.mass))
    bubble2.velocity = vm_add(bubble2.velocity, vm_div(impulse, bubble2.mass))
}

function correctPositions(bubble1, bubble2)
{
    let normal = vm_sub(bubble2.getPosition(), bubble1.getPosition())
    const distSquared = vm_magSq(normal)
        radiusAdded = bubble1.radius + bubble2.radius

    if (distSquared > radiusAdded * radiusAdded)
        return

    const dist = Math.sqrt(distSquared)

    if (dist != 0)
    {
        penetration = radiusAdded - dist
        normal = vm_normalize(normal)
    }
    else
    {
        penetration = bubble1.radius
        normal = { x: 1, y: 0 }
    }

    const percent = 0.9
    const slop = 0.08
    const correction = vm_mult(normal, percent * Math.max(penetration - slop, 0))

    bubble1.move(vm_mult(correction, -0.5))
    bubble2.move(vm_mult(correction, 0.5))
}