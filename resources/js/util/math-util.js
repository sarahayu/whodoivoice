function getOffscreenPoint()
{
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
}

/**
 * Returns vector representing gravity force vector towards center of screen
 * @param {Vector} curLoc 
 * @return {Vector}
 */
function getGravVector(curLoc)
{
    let gravVector
    const windowWidth = window.innerWidth, windowHeight = window.innerHeight
    if (windowWidth > windowHeight)
    {
        const halfHeight = windowHeight / 2
        let leftPoint = new Vector(halfHeight, halfHeight),
            rightPoint = new Vector(windowWidth - halfHeight, halfHeight)

        if (curLoc.x >= leftPoint.x && curLoc.x <= rightPoint.x)
            gravVector = new Vector(0, halfHeight - curLoc.y)
        else
            gravVector = ((curLoc.x > rightPoint.x) ? rightPoint : leftPoint).sub(curLoc)
    }
    else
    {
        const halfWidth = windowWidth / 2
        let topPoint = new Vector(halfWidth, halfWidth),
            bottomPoint = new Vector(windowHeight - halfWidth, halfWidth)

        if (curLoc.y <= topPoint.y && curLoc.y >= bottomPoint.y)
            gravVector = new Vector(0, halfWidth - curLoc.x)
        else
            gravVector = ((curLoc.y > bottomPoint.y) ? bottomPoint : topPoint).sub(curLoc)
    }

    return gravVector.normalize().mult(20)
}

/**
 * @param {number} width 
 * @param {number} height 
 * @return {Vector}
 */
function randPoint(width, height)
{
    return new Vector(Math.random() * width, Math.random() * height)
}

/**
 * @param {Vector} point 
 * @param {number} padding 
 * @return {Vector}
 */
function onScreen(point, padding)
{
    const { x, y } = point
    return x >= -padding && x <= window.innerWidth + padding &&
        y >= -padding && y <= window.innerHeight + padding;
}

/**
 * 
 * @param {string} str 
 * @param {number} maxLen 
 * @return {string}
 */
function trimMaxLength(str, maxLen)
{
    return str.length > maxLen ? str.substring(0, maxLen - 3).trim() + "..." : str;
}

/**
 * 
 * @param {number} min 
 * @param {number} max 
 * @param {number} a 
 * @return {number}
 */
function lerp(min, max, a)
{
    return (max - min) * a + min
}