function engineInitialize(voiceActor, app)
{
    velocityFactor = 1
    velocityDecreaseRate = 0.99995

    bubbleQueue = []
    bubbles = []
    bubbleGrabbed = false
    mouseDragging = false
    wasClickAction = false
    finalBubbleAmt = undefined
    hasSlowedDown = false

    createBubbles(voiceActor, app)
}

function render()
{
    clear()
    buffer.clear()

    // used to order rendering, which is:
    // 1. non-expanding, background bubbles
    // 2. bubbles with text
    // 3. expanding, grabbed bubble
    let expandingBubble
    let bubblesWithText = []

    // 1.
    for (const bubble of bubbles)
    {
        if (bubble.animation.expanding)
            expandingBubble = bubble
        else if (bubble.animation.radius != bubble.animation.constRadius)
            bubblesWithText.push(bubble)
        else
            bubble.drawBatch(buffer)
    }

    push()
    drawingContext.shadowOffsetX = 2
    drawingContext.shadowOffsetY = 2
    drawingContext.shadowBlur = 8
    drawingContext.shadowColor = 'rgba(0,0,0,0.5)'
    image(buffer, 0, 0)
    pop()
        
    push()
    textAlign(CENTER, BASELINE)
    imageMode(CENTER)

    // 2.
    for (const bubble of bubblesWithText)
    {
        bubble.drawWShadow(this)
        bubble.drawLabel(this)
    }

    // 3.
    if (expandingBubble)
    {
        expandingBubble.drawWShadow(this)
        expandingBubble.drawLabel(this)
    }
    pop()
}

function createBubbles(vaMALID, app)
{    
    $('#loading-message').hide().text('Getting data...').fadeIn()

    Promise.all([
        firebase.database().ref('tops').once('value')
            .then(response => response.val()),
        $.getJSON(`https://api.jikan.moe/v3/person/${vaMALID}`)
        ])
        .then(([animeRankingData, vaData]) => {            
            updateTops(animeRankingData)   

            const characters = parseCharactersFromJSON(vaData, animeRankingData)
            const voiceActor = parseVAFromJSON(vaData)
            
            $('#loading-message').hide().text('Creating bubbles...').fadeIn()

            const bubbleResourceCalls = []
            
            bubbleResourceCalls.push({
                name: voiceActor.name,
                url: voiceActor.picURL,
                onComplete: () => {
                    bubbleQueue.push(createVABubble(voiceActor, app))
                }
            })

            finalBubbleAmt = Math.min(MAX_BUBBLES, characters.length)
            for (let i = 0; i < finalBubbleAmt; i++)
                bubbleResourceCalls.push({
                    name: characters[i].characterID.toString(),
                    url: characters[i].picURL,
                    onComplete: () => {
                        bubbleQueue.push(createCharacterBubble(characters, i, null, app))
                    }
                })


            const loader = PIXI.Loader.shared

            loader
                .add(bubbleResourceCalls)
                .load(() => $('#loading-message').fadeOut())
            
            loader.onStart.add(() => console.log('Starting...'))
            loader.onProgress.add(() => $('#loading-message').text(`${Math.floor(loader.progress)}%`))

            finalBubbleAmt += 1
        })
        .catch(err => {
            console.log(err)
        })
}

function addBubbles()
{
    if (bubbleQueue.length != bubbles.length &&
        frameCount % INTRO_BUBBLE_EVERY_N_FRAME == 0)
    {
        bubbles.push(bubbleQueue[bubbles.length])
    }
}

function slowdown()
{
    velocityFactor = Math.max(velocityFactor *= velocityDecreaseRate, 0.5)

    if (!hasSlowedDown && bubbleQueue.length == finalBubbleAmt &&
        bubbleQueue.length == bubbles.length && velocityDecreaseRate != 0.998)
    {
        hasSlowedDown = true
        setTimeout(() =>
        {
            console.log('slowed down')
            velocityDecreaseRate = 0.998
        }, 2000)
    }
}

function createVABubble(voiceActor, app)
{
    let { x, y } = getOffscreenPoint()
    return new Bubble({
        topStr: voiceActor.japaneseName,
        bottomStr: voiceActor.name,
        textureID: voiceActor.name,
        radius: 100,
        x: x,
        y: y,
        textColor: 'white',
        borderColor: 'black',
        url: voiceActor.profileURL,
        relativeScale: 1
    }, app)
}

function createCharacterBubble(characters, offset, img, app)
{
    let { x, y } = getOffscreenPoint(),
        scale = lerp(0, 5 / 6, Math.pow((MAX_BUBBLES - offset) / MAX_BUBBLES, 2)),
        character = characters[offset]
    return new Bubble({
        topStr: character.name,
        bottomStr: character.animeStr,
        textureID: character.characterID.toString(),
        radius: scale * 60 + 40,
        x: x,
        y: y,
        textColor: 'black',
        borderColor: 'white',
        url: character.profileURL,
        image: img,
        relativeScale: scale
    }, app)
}
