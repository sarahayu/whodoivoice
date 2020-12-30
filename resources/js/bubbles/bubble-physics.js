function resolveCollisionVelocity(bubble1, bubble2)
{
    const normal = bubble2.getPosition().sub(bubble1.getPosition())
    const distSquared = normal.magSq(),
        radiusAdded = bubble1.radius + bubble2.radius


    if (distSquared > radiusAdded * radiusAdded)
        return

    const dist = Math.sqrt(distSquared)

    if (dist != 0)
    {
        penetration = radiusAdded - dist
        normal.set(normal.normalize())
    }
    else
    {
        penetration = bubble1.radius
        normal.set(1, 0)
    }

    const rv = bubble2.velocity.sub(bubble1.velocity)
    const velAlongNormal = rv.dot(normal)

    if (velAlongNormal > 0)
        return

    const j = -(1 + RESTITUTION) * velAlongNormal / (bubble1.invMass + bubble2.invMass)

    const impulse = normal.mult(j)
    bubble1.velocity = bubble1.velocity.sub(impulse.div(bubble1.mass))
    bubble2.velocity = bubble2.velocity.add(impulse.div(bubble2.mass))
}

function correctPositions(bubble1, bubble2)
{
    const normal = bubble2.getPosition().sub(bubble1.getPosition())
    const distSquared = normal.magSq(),
        radiusAdded = bubble1.radius + bubble2.radius

    if (distSquared > radiusAdded * radiusAdded)
        return

    const dist = Math.sqrt(distSquared)

    if (dist != 0)
    {
        penetration = radiusAdded - dist
        normal.set(normal.normalize())
    }
    else
    {
        penetration = bubble1.radius
        normal.set(1, 0)
    }

    const percent = 0.9
    const slop = 0.08
    const correction = normal.mult(percent * Math.max(penetration - slop, 0))

    bubble1.move(correction.mult(-0.5))
    bubble2.move(correction.mult(0.5))
}