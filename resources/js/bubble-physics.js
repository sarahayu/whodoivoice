

function resolveCollisionVelocity(bubble1, bubble2)
{
    let normal = p5.Vector.sub(bubble2.location, bubble1.location);
    let distSquared = normal.magSq(),
        radiusAdded = bubble1.radius + bubble2.radius;

    if (distSquared > radiusAdded * radiusAdded)
        return;

    let dist = Math.sqrt(distSquared);

    if (dist != 0)
    {
        penetration = radiusAdded - dist;
        normal.normalize();
    }
    else
    {
        penetration = bubble1.radius;
        normal = createVector(1, 0);
    }

    let rv = p5.Vector.sub(bubble2.velocity, bubble1.velocity);
    let velAlongNormal = rv.dot(normal);

    if (velAlongNormal > 0)
        return;

    let j = -(1 + RESTITUTION) * velAlongNormal;
    j /= bubble1.invMass + bubble2.invMass;

    let impulse = p5.Vector.mult(normal, j);
    bubble1.velocity.sub(p5.Vector.div(impulse, bubble1.mass));
    bubble2.velocity.add(p5.Vector.div(impulse, bubble2.mass));
}

function correctPositions(bubble1, bubble2)
{
    let normal = p5.Vector.sub(bubble2.location, bubble1.location);
    let distSquared = normal.magSq(),
        radiusAdded = bubble1.radius + bubble2.radius;

    if (distSquared > radiusAdded * radiusAdded)
        return;

    let dist = Math.sqrt(distSquared);

    if (dist != 0)
    {
        penetration = radiusAdded - dist;
        normal.normalize();
    }
    else
    {
        penetration = bubble1.radius;
        normal = createVector(1, 0);
    }

    let percent = 0.9;
    let slop = 0.08;
    let correction = p5.Vector.mult(normal, percent * Math.max(penetration - slop, 0));
    bubble1.location.sub(p5.Vector.mult(correction, 0.5));
    bubble2.location.add(p5.Vector.mult(correction, 0.5));
}