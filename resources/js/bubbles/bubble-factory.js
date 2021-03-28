function createBubbles(vaMALID, bubbleQueue, context, application)
{    
    $('#loading-message').hide().text('Getting data...').fadeIn()

    Promise.all([
        requestAnimeRankings(),
        $.getJSON(`https://api.jikan.moe/v3/person/${vaMALID}`)
        // $.getJSON('resources/json/placeholder.json')
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


            // const searchImgURL = 'resources/img/search.png' 
            // bubbleResourceCalls.push({
            //     name: searchImgURL,
            //     url: searchImgURL,
            //     onComplete: () => {
            //         bubbleQueue.push(createSearchBubble(searchImgURL, context, application))
            //     }
            // })

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

            context.totalBubbles.value = finalBubbleAmt + 1


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
        callback: createLinkAction(voiceActor.profileURL),
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
        callback: createLinkAction(character.profileURL),
        relativeScale: getBubbleScale(offset),
        context: context
    })
}

function createSearchBubble(imgLink, context, application)
{
    return new Bubble({
        bottomStr: 'Search',
        textureID: imgLink,
        radius: 0.5 * 60 + 40,
        position: getOffscreenPoint(),
        textColor: 'black',
        borderColor: 0xffffff,
        callback: () => application.requestStateChange('push', 'searchState'),
        relativeScale: 0.5,
        context: context
    })
}

function getBubbleScale(bubbleOffset)
{
    return lerp(0, 5 / 6, Math.pow((MAX_BUBBLES - bubbleOffset) / MAX_BUBBLES, 2))
}

function createLinkAction(url)
{
    return () => window.open(url, '_blank')
}