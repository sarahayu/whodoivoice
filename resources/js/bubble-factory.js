function createBubbles(vaMALID, bubbleQueue, app)
{    
    $('#loading-message').hide().text('Getting data...').fadeIn()

    Promise.all([
        requestAnimeRankings(),
        $.getJSON(`https://api.jikan.moe/v3/person/${vaMALID}`)
        ])
        .then(([animeRankingData, vaData]) => {            
            updateRankings(animeRankingData)   

            const characters = parseCharactersFromJSON(vaData, animeRankingData)
            const voiceActor = parseVAFromJSON(vaData)
            
            $('#loading-message').hide().text('Creating bubbles...').fadeIn()

            const bubbleResourceCalls = []

            if (!voiceActor.picURL.includes('questionmark'))
                bubbleResourceCalls.push({
                    name: voiceActor.name,
                    url: voiceActor.picURL,
                    onComplete: () => {
                        bubbleQueue.push(createVABubble(voiceActor, app))
                    }
                })
            else
                bubbleQueue.push(createVABubble(voiceActor, app))

            finalBubbleAmt = Math.min(MAX_BUBBLES, characters.length)
            for (let i = 0; i < finalBubbleAmt; i++)
                if (!characters[i].picURL.includes('questionmark'))
                    bubbleResourceCalls.push({
                        name: characters[i].characterID.toString(),
                        url: characters[i].picURL,
                        onComplete: () => {
                            bubbleQueue.push(createCharacterBubble(characters, i, app))
                        }
                    })
                else
                    bubbleQueue.push(createCharacterBubble(characters, i, app))


            PIXI.Loader.shared
                .add(bubbleResourceCalls)
                .load(() => $('#loading-message').fadeOut())
            

            finalBubbleAmt += 1
        })
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
        borderColor: 0x0,
        url: voiceActor.profileURL,
        relativeScale: 1
    }, app)
}

function createCharacterBubble(characters, offset, app)
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
        borderColor: 0xffffff,
        url: character.profileURL,
        relativeScale: scale
    }, app)
}
