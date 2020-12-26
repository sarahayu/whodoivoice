

function resolveCollisionVelocity(bubble1, bubble2)
{
    let normal = bubble2.getBorderPos().sub(bubble1.getBorderPos())
    let distSquared = normal.magSq(),
        radiusAdded = bubble1.radius + bubble2.radius;

    if (distSquared > radiusAdded * radiusAdded)
        return;

    let dist = Math.sqrt(distSquared);

    if (dist != 0)
    {
        penetration = radiusAdded - dist;
        normal = normal.normalize();
    }
    else
    {
        penetration = bubble1.radius;
        normal = new Vector(1, 0);
    }

    let rv = bubble2.velocity.sub(bubble1.velocity)
    let velAlongNormal = rv.dot(normal);

    if (velAlongNormal > 0)
        return;

    let j = -(1 + RESTITUTION) * velAlongNormal;
    j /= bubble1.invMass + bubble2.invMass;

    let impulse = normal.mult(j)
    bubble1.velocity = bubble1.velocity.sub(impulse.div(bubble1.mass));
    bubble2.velocity = bubble2.velocity.add(impulse.div(bubble2.mass));
}

function correctPositions(bubble1, bubble2)
{
    let normal = bubble2.getBorderPos().sub(bubble1.getBorderPos())
    let distSquared = normal.magSq(),
        radiusAdded = bubble1.radius + bubble2.radius;

    if (distSquared > radiusAdded * radiusAdded)
        return;

    let dist = Math.sqrt(distSquared);

    if (dist != 0)
    {
        penetration = radiusAdded - dist;
        normal = normal.normalize();
    }
    else
    {
        penetration = bubble1.radius;
        normal = new Vector(1, 0);
    }

    let percent = 0.9;
    let slop = 0.08;
    let correction = normal.mult(percent * Math.max(penetration - slop, 0))

    {
        let { x, y } = bubble1.getBorderPos().sub(correction.mult(0.5))
        bubble1.setBorderPos(x, y)
        // bubble1.border.position.set(x, y)
    }

    {
        let { x, y } = bubble2.getBorderPos().add(correction.mult(0.5))
        bubble2.setBorderPos(x, y)
        // bubble2.border.position.set(x, y)
    }
}