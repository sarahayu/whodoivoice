// https://jsfiddle.net/themoonrat/br35x20j/
function defineCurvePoints(points, radius, texWidth, offset)
{
    const spaceBWPoint = 10, totalPoints = Math.floor(texWidth / spaceBWPoint) + 1
    if (points.length == 0)
        points.push(...Array(totalPoints))

    const step = (texWidth / (totalPoints - 1)) / radius, start = -Math.PI / 2 - (texWidth / 2) / radius + offset
    
    for (let i = 0; i < totalPoints; i++)
    {
        const x = radius * Math.cos( start + step * i );
        const y = radius * Math.sin( start + step * i );
        points[i] = new PIXI.Point( x, y )
    }
}

function getMousePos(pixiApp)
{
    return pixiApp.renderer.plugins.interaction.mouse.global
}