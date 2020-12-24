function getOffscreenPoint()
{
    // return new Vector(Math.random() * (window.innerWidth + 1000) - 500, Math.random() * (window.innerHeight + 1000) - 500)
    let point;
    do {
        point = new Vector(Math.random() * (window.innerWidth + 1000) - 500, Math.random() * (window.innerHeight + 1000) - 500)
    }
    while (onScreen(point, 100))
    return point
}

function onScreen(point, border)
{
    const { x, y } = point
    return x >= -border && x <= window.innerWidth + border &&
        y >= -border && y <= window.innerHeight + border;
}

function trimMaxLength(str, max)
{
    return str.length > max ? str.substring(0, max - 3).trim() + "..." : str;
}

function lerp(min, max, a)
{
    return (max - min) * a + min
}