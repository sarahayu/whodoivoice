class SearchState
{
    constructor(appContext)
    {
        this.appContext = appContext
        $(".searchbar").on('input', () => {
            $('.results').empty()
            const query = $('#mal-query').val()
            this.addSearchResult(query, 'resources/img/image.png', parseInt(query))
        });

    }

    exit()
    {
        $('.results').empty()
        $('.searcher').hide()
    }

    update(dt)
    {
        // intentionally blank, nothing to update in search state
    }

    addSearchResult(name, img, malID)
    {
        const searchResult = $('<div/>', {
            'class': 'search-result',
            on: {
                'click': () => 
                {
                    this.appContext.application.requestStateChanges([
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