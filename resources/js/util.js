function getOffscreenPoint()
{
    let point;
    do {
        point = createVector(Math.random() * (windowWidth + 1000) - 500, Math.random() * (windowHeight + 1000) - 500);
    }
    while (onScreen(point, 100));
    return point;
}

function onScreen(point, border)
{
    return point.x >= -border && point.x <= windowWidth + border &&
        point.y >= -border && point.y <= windowHeight + border;
}

function drawCurvedText(str, radius, scale, x, y, offset, color, ctx)
{
    ctx.textFont('Courier New', scale);

    let arcLength = 0;
    let totalAngle = ctx.textWidth(str) / radius;

    for (let i = 0; i < str.length; i++)
    {
        let currentChar = str.charAt(i);
        let w = ctx.textWidth(currentChar);

        arcLength += w / 2;
        let theta = arcLength / radius - totalAngle / 2 + offset;

        ctx.push();
        ctx.fill(color);
        ctx.translate(x, y);
        ctx.rotate(theta);
        ctx.translate(0, -radius);
        ctx.text(currentChar, 0, 0);
        ctx.pop();

        arcLength += w / 2;
    }
}
