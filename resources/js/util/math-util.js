function getOffscreenPoint()
{
    // return new Vector(Math.random() * (window.innerWidth + 1000) - 500, Math.random() * (window.innerHeight + 1000) - 500)

    switch (Math.floor(Math.random() * 4))
    {
        case 0:
            return randPoint(window.innerWidth, 400).add(new Vector(0, -500))
        case 1:
            return randPoint(window.innerWidth, 400).add(new Vector(0, window.innerHeight + 100))
        case 2:
            return randPoint(400, window.innerHeight + 1000).add(new Vector(-500, -500))
        case 3:
            return randPoint(400, window.innerHeight + 1000).add(new Vector(window.innerWidth + 100, -500))
    }

    // let point;
    // do {
    //     point = new Vector(Math.random() * (window.innerWidth + 1000) - 500, Math.random() * (window.innerHeight + 1000) - 500)
    // }
    // while (onScreen(point, 100))
    // return point
}

function randPoint(width, height)
{
    return new Vector(Math.random() * width, Math.random() * height)
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