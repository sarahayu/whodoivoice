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

function drawCurvedText(textOpts)
{
    textOpts.ctx.textFont('Courier New', textOpts.scale);

    let arcLength = 0;
    let letterSpacing = 2;
    let totalAngle = (textOpts.ctx.textWidth(textOpts.str) + (textOpts.str.length - 1) * letterSpacing) / textOpts.radius;

    for (let i = 0; i < textOpts.str.length; i++)
    {
        let currentChar = textOpts.str.charAt(i);
        let w = textOpts.ctx.textWidth(currentChar);

        arcLength += w / 2 + letterSpacing;
        let theta = arcLength / textOpts.radius - totalAngle / 2 + textOpts.offset;

        textOpts.ctx.push();
        textOpts.ctx.fill(textOpts.color);
        textOpts.ctx.translate(textOpts.x, textOpts.y);
        textOpts.ctx.rotate(theta);
        textOpts.ctx.translate(0, -textOpts.radius);
        textOpts.ctx.textStyle(textOpts.style ? textOpts.style : NORMAL);
        textOpts.ctx.text(currentChar, 0, 0);
        textOpts.ctx.pop();

        arcLength += w / 2;
    }
}

function trimMaxLength(str, max)
{
    return str.length > max ? str.substring(0, max - 3).trim() + "..." : str;
}