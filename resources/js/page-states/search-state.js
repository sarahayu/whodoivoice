class SearchState
{
    constructor(appContext)
    {
        this.appContext = appContext
        
        this.addSearchResult('Aoi Yuuki', '//cdn.myanimelist.net/images/voiceactors/2/50769.jpg', 6686)
        this.addSearchResult('Mamoru Miyano', '//cdn.myanimelist.net/images/voiceactors/1/42141.jpg', 65)
        this.addSearchResult('Erika Harlacher', '//cdn.myanimelist.net/images/voiceactors/2/58363.jpg', 21785)

        $(".searchbar")
            .submit(evnt => {
                evnt.preventDefault()
                const results = $('.results').children()
                if (results.length != 0)
                    results[0].click()
            })
            .on('input', () => {
                $('.results').empty()
                const query = $('#mal-query').val()
                this.addSearchResult(query, 'resources/img/image.png', parseInt(query))
            });

        $('.exit-button').click(() => appContext.application.requestStateChange('pop'))

        $('.search-container').hide()
    }

    enter(options)
    {
        $(".search-container").show()
    }

    exit()
    {
        $('.results').empty()
        $('.search-container').hide()
    }

    setIdle(idle)
    {

    }

    update(dt)
    {
        // intentionally blank, nothing to update in search state
    }

    addSearchResult(name, img, malID)
    {
        const searchResult = $('<div/>', {
            'class': 'search-result',
            tabindex: '0',
            on: {
                'click': () => 
                {
                    this.appContext.application.requestStateChanges([
                        /* pop searchbar and pop old bubblefield */
                        {
                            action: 'pop'
                        },
                        {
                            action: 'pop'
                        },
                        {
                            action: 'push',
                            state: 'bubbleField',
                            options: {
                                vaMALID: malID
                            }
                        }
                    ])
                }
            }
        }).appendTo('.results')

        const infoWrapper = $('<div/>', {
            'class': 'info-wrapper'
        }).appendTo(searchResult)

        const thumbnail = $('<div/>', {
            'class': 'thumbnail',
            'css': {
                'background-image': `url(${ img })`
            }
        }).appendTo(infoWrapper)

        const nameP = $('<p/>', {
            'class': 'result-str',
            text: name
        }).appendTo(infoWrapper)
    }
}