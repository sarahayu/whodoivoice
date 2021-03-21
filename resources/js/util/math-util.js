function getOffscreenPoint()
{
    switch (Math.floor(Math.random() * 4))
    {
        case 0:
            return vm_add(randPoint(window.innerWidth, 400), 0, -500)
        case 1:
            return vm_add(randPoint(window.innerWidth, 400), 0, window.innerHeight + 100)
        case 2:
            return vm_add(randPoint(400, window.innerHeight + 1000), -500, -500)
        case 3:
            return vm_add(randPoint(400, window.innerHeight + 1000), window.innerWidth + 100, -500)
    }
}

function getGravVector(curLoc)
{
    let gravVector
    const windowWidth = window.innerWidth, windowHeight = window.innerHeight
    if (windowWidth > windowHeight)
    {
        const halfHeight = windowHeight / 2
        const leftPoint = new PIXI.Point(halfHeight, halfHeight),
            rightPoint = new PIXI.Point(windowWidth - halfHeight, halfHeight)

        if (curLoc.x >= leftPoint.x && curLoc.x <= rightPoint.x)
            gravVector = new PIXI.Point(0, halfHeight - curLoc.y)
        else
            gravVector = vm_sub((curLoc.x > rightPoint.x) ? rightPoint : leftPoint, curLoc)
    }
    else
    {
        const halfWidth = windowWidth / 2
        const topPoint = new PIXI.Point(halfWidth, halfWidth),
            bottomPoint = new PIXI.Point(halfWidth, windowHeight - halfWidth)

        if (curLoc.y >= topPoint.y && curLoc.y <= bottomPoint.y)
            gravVector = new PIXI.Point(halfWidth - curLoc.x, 0)
        else
            gravVector = vm_sub((curLoc.y > bottomPoint.y) ? bottomPoint : topPoint, curLoc)
    }

    return vm_mult(vm_normalize(gravVector), 20)
}

function randPoint(width, height)
{
    return new PIXI.Point(Math.random() * width, Math.random() * height)
}

function onScreen(point, padding)
{
    const { x, y } = point
    return x >= -padding && x <= window.innerWidth + padding &&
        y >= -padding && y <= window.innerHeight + padding;
}

function trimMaxLength(str, maxLen)
{
    return str.length > maxLen ? str.substring(0, maxLen - 3).trim() + "..." : str;
}

function lerp(min, max, a)
{
    return (max - min) * a + min
}