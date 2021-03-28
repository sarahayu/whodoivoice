function engineInitialize(voiceActor)
{
    velocityFactor = 1;
    velocityDecreaseRate = 0.99995;

    bubbleQueue = [];
    bubbles = [];
    bubbleGrabbed = false;
    mouseDragging = false;
    wasClickAction = false;
    finalBubbleAmt = undefined;
    hasSlowedDown = false;

    createBubbles(voiceActor);
}

function update()
{
    if (bubbleQueue.length == finalBubbleAmt && $("#loading-message").is(":visible"))
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

    // 1.
    for (const bubble of bubbles)
    {
        if (bubble.animation.expanding)
            expandingBubble = bubble;
        else if (bubble.animation.radius != bubble.animation.constRadius)
            bubblesWithText.push(bubble);
        else
            bubble.drawBatch(buffer);
    }

    push();
    drawingContext.shadowOffsetX = 2;
    drawingContext.shadowOffsetY = 2;
    drawingContext.shadowBlur = 8;
    drawingContext.shadowColor = 'rgba(0,0,0,0.5)';
    image(buffer, 0, 0);
    pop();
        
    push();
    textAlign(CENTER, BASELINE);
    imageMode(CENTER);

    // 2.
    for (const bubble of bubblesWithText)
    {
        bubble.drawWShadow(this);
        bubble.drawLabel(this);
    }

    // 3.
    if (expandingBubble)
    {
        expandingBubble.drawWShadow(this);
        expandingBubble.drawLabel(this);
    }
    pop();
}

function createBubbles(vaMALID)
{    
    $("#loading-message").hide().text("Getting data...").fadeIn();

    Promise.all([
        firebase.database().ref("tops").once("value")
            .then(response => response.val()),
        $.getJSON(`https://api.jikan.moe/v3/person/${vaMALID}`)
        ])
        .then(([topAnimesData, characterData]) => {            
            updateTops(topAnimesData)   

            let characters = parseCharactersFromJSON(characterData, topAnimesData)
            createCharacterBubbles(characters)
            createVABubble(parseVAFromJSON(characterData))
        })
        .catch(err => {
            console.log(err)
        })

function addBubbles()
{
    if (bubbleQueue.length != bubbles.length &&
        frameCount % INTRO_BUBBLE_EVERY_N_FRAME == 0)
    {
        bubbles.push(bubbleQueue[bubbles.length]);
    }
}

function slowdown()
{
    velocityFactor = max(velocityFactor *= velocityDecreaseRate, 0.5);

    if (!hasSlowedDown && bubbleQueue.length == finalBubbleAmt &&
        bubbleQueue.length == bubbles.length && velocityDecreaseRate != 0.998)
    {
        hasSlowedDown = true;
        setTimeout(() =>
        {
            velocityDecreaseRate = 0.998;
        }, 2000);
    }
}

function createCharacterBubbles(characters)
{
    $("#loading-message").hide().text("Creating bubbles...").fadeIn();

    finalBubbleAmt = min(MAX_BUBBLES, characters.length);
    for (let i = 0; i < finalBubbleAmt; i++)
        (function (j)
        {
            if (!characters[j].picURL.includes("questionmark"))
                loadImage(characters[j].picURL, img =>
                {
                    bubbleQueue.push(createCharacterBubble(characters, j, img));
                });
            else
                bubbleQueue.push(createCharacterBubble(characters, j));

        })(i);
    finalBubbleAmt += 1;
}

function createVABubble(voiceActor)
{
    loadImage(voiceActor.picURL, img =>
    {
        let offscreen = getOffscreenPoint();
        bubbleQueue.push(new Bubble({
            topStr: voiceActor.japaneseName,
            bottomStr: voiceActor.name,
            radius: 100,
            x: offscreen.x,
            y: offscreen.y,
            textColor: 'white',
            borderColor: 'black',
            url: voiceActor.profileURL,
            image: img,
            relativeScale: 1
        }));
    });
}

function createCharacterBubble(characters, offset, img)
{
    let offscreen = getOffscreenPoint(),
        scale = lerp(0, 5 / 6, Math.pow((MAX_BUBBLES - offset) / MAX_BUBBLES, 2)),
        character = characters[offset];
    return new Bubble({
        topStr: character.name,
        bottomStr: character.animeStr,
        radius: scale * 60 + 40,
        x: offscreen.x,
        y: offscreen.y,
        textColor: 'black',
        borderColor: 'white',
        url: character.profileURL,
        image: img,
        relativeScale: scale
    });
}
