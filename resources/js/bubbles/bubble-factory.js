/**
 * @param {number} vaMALID 
 * @param {Bubble[]} bubbleQueue 
 * @param {Context} context 
 */
function createBubbles(vaMALID, bubbleQueue, context)
{    
    $('#loading-message').hide().text('Getting data...').fadeIn()

    Promise.all([
        requestAnimeRankings(),
        // $.getJSON(`https://api.jikan.moe/v3/person/${vaMALID}`)
        $.getJSON('resources/json/placeholder.json')
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
                        bubbleQueue.push(createVABubble(voiceActor, context))
                    }
                })
            else
                bubbleQueue.push(createVABubble(voiceActor, context))

            const finalBubbleAmt = Math.min(MAX_BUBBLES, characters.length)
            for (let i = 0; i < finalBubbleAmt; i++)
            {
                if (!characters[i].picURL.includes('questionmark'))
                    bubbleResourceCalls.push({
                        name: characters[i].characterID.toString(),
                        url: characters[i].picURL,
                        onComplete: () => {
                            bubbleQueue.push(createCharacterBubble(characters[i], i, context))
                        }
                    })
                else
                    bubbleQueue.push(createCharacterBubble(characters[i], i, context))
            }


            PIXI.Loader.shared
                .add(bubbleResourceCalls)
                .load(() => $('#loading-message').fadeOut())
            // PIXI.Loader.shared
            //     .add('splash', 'resources/img/image.png')
            //     .load(() => {
            //         bubbleQueue.push(createVABubble(voiceActor, context))

            //         let offset = 0
            //         const characterBubbles = characters.splice(0, finalBubbleAmt).map(
            //             character => createCharacterBubble(character, offset++, context))

            //         bubbleQueue.push(...characterBubbles)
                    
            //         $('#loading-message').fadeOut()
            //     })
        })
}

function createVABubble(voiceActor, context)
{
    return new Bubble({
        topStr: voiceActor.japaneseName,
        bottomStr: voiceActor.name,
        textureID: voiceActor.name,
        radius: 100,
        position: getOffscreenPoint(),
        textColor: 'white',
        borderColor: 0x0,
        url: voiceActor.profileURL,
        relativeScale: 1,
        context: context
    })
}

function createCharacterBubble(character, offset, context)
{
    return new Bubble({
        topStr: character.name,
        bottomStr: character.animeStr,
        textureID: character.characterID.toString(),
        radius: getBubbleScale(offset) * 60 + 40,
        position: getOffscreenPoint(),
        textColor: 'black',
        borderColor: 0xffffff,
        url: character.profileURL,
        relativeScale: getBubbleScale(offset),
        context: context,
        offset: offset
    })
}

function getBubbleScale(bubbleOffset)
{
    return lerp(0, 5 / 6, Math.pow((MAX_BUBBLES - bubbleOffset) / MAX_BUBBLES, 2))
}