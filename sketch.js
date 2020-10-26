let bubbleCanvas;
let x = 0;

function setup()
{
    bubbleCanvas = createCanvas(windowWidth, windowHeight);
    bubbleCanvas.parent('bubble-area');
    background(100);
}

function draw()
{
    background(100);
    ellipse(x, height / 2, 20, 20);
    x++;
}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
}
