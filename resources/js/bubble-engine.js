function update()
{
    if (bubbleQueue.length == finalBubbleAmt)
        $("#loading-message").fadeOut();

    addBubbles();
    slowdown();

    cursor(ARROW);

    for (const bubble of bubbles)
        bubble.update();

    for (let b1 = 0; b1 < bubbles.length - 1; b1++)
        for (let b2 = b1 + 1; b2 < bubbles.length; b2++)
            resolveCollisionVelocity(bubbles[b1], bubbles[b2]);

    for (let b1 = 0; b1 < bubbles.length - 1; b1++)
        for (let b2 = b1 + 1; b2 < bubbles.length; b2++)
            correctPositions(bubbles[b1], bubbles[b2]);
}

function render()
{
    clear();


    buffer.clear();

    // used to order rendering, which is:
    // 1. non-expanding, background bubbles
    // 2. bubbles with text
    // 3. expanding, grabbed bubble
    let expandingBubble;
    let bubblesWithText = [];

    for (const bubble of bubbles)
    {
        if (bubble.animation.expanding)
            expandingBubble = bubble;
        else if (bubble.animation.radius != bubble.animation.constRadius)
            bubblesWithText.push(bubble);
        else
            bubble.draw(buffer, true);
    }

    push();
    /*    drawingContext.shadowOffsetX = 2;
        drawingContext.shadowOffsetY = 2;
        drawingContext.shadowBlur = 8;
        drawingContext.shadowColor = 'rgba(0,0,0,0.5)';*/
    image(buffer, 0, 0);
    pop();

    push();
    textAlign(CENTER, BASELINE);
    imageMode(CENTER);

    for (const bubble of bubblesWithText)
    {
        bubble.draw(this, false);
        bubble.drawLabel(this);
    }

    if (expandingBubble)
    {
        expandingBubble.draw(this, false);
        expandingBubble.drawLabel(this);
    }
    pop();
}

function addBubbles()
{
    if (bubbleQueue.length != bubbles.length &&
        frameCount % INTRO_BUBBLE_EVERY_N_FRAME == 0)
        bubbles.push(bubbleQueue[bubbles.length]);
}

function slowdown()
{
    velocityFactor = max(velocityFactor *= velocityDecreaseRate, 0.5);

    if (bubbleQueue.length == finalBubbleAmt &&
        bubbleQueue.length == bubbles.length && velocityDecreaseRate != 0.998)
    {
        setTimeout(() =>
        {
            velocityDecreaseRate = 0.998;
        }, 2000);
    }
}
