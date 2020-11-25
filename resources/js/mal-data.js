function populateCharacterData(callback)
{
    let tops = [];
    loadTopAnime(tops, () =>
    {
        $("#loading-message").hide().text("Retrieving voice actor...").fadeIn();
        
        loadJSON("resources/json/test_va_response.json", json_response =>
        {
            let characters = createCharactersFromJSON(json_response, tops);
            callback(characters);
        });
    });
    //    return $.when(loadTopAnime(tops)).then(() =>
    //    {
    //        return $.getJSON("resources/json/test_va_response.json", json_response =>
    //        {
    //            characters.push(...createCharactersFromJSON(json_response, tops));
    //            console.log("Characters json!", characters.length);
    //        })
    //    });
}

function loadTopAnime(tops, callback)
{
    $("#loading-message").hide().text("Getting data").fadeIn();
    
    let topPages = [
        "resources/json/test_top_1_response.json",
        "resources/json/test_top_2_response.json",
        "resources/json/test_top_3_response.json",
        "resources/json/test_top_4_response.json"
    ];

    loadTopPage(tops, topPages, topPages.length - 1, callback);
    //
    //    //https://stackoverflow.com/a/34489218
    //    return $.when.apply($, $.map(topPages, page =>
    //    {
    //        return $.getJSON(page, json_response =>
    //        {
    //            addToTops(json_response, tops);
    //        });
    //    }));
}

function loadTopPage(tops, pages, i, callback)
{
    if (pages.length - 1 != i)
        $("#loading-message").text((offset, curText) =>
        {
            return curText += ".";
        });

    if (i == 0)
        loadJSON(pages[i], (json) =>
        {
            addToTops(json, tops);
            callback();
        });
    else
        loadJSON(pages[i], (json) =>
        {
            addToTops(json, tops);
            (function (j)
            {
                setTimeout(() =>
                {
                    loadTopPage(tops, pages, --j, callback);
                }, 1000);
            })(i);
        });
}

function createCharactersFromJSON(json, tops)
{
    let ids = [],
        characters = []
    for (const roles of json.voice_acting_roles)
    {
        // if character has appeared in a previous anime, skip
        let id = roles.character.mal_id;
        if (ids.includes(id)) continue;
        else ids.push(id);

        let name = roles.character.name;
        let commaIndex = name.search(', ');
        if (commaIndex != -1)
            name = `${name.substring(commaIndex + 2)} ${name.substring(0, commaIndex)}`;
        characters.push(
        {
            name: name,
            picURL: roles.character.image_url,
            animeID: roles.anime.mal_id,
            animeStr: roles.anime.name,
            rank: getRank(tops, roles.anime.mal_id)
        });
    }
    
    characters.sort((first, second) =>
    {
        return first.rank - second.rank;
    });
    
    return characters;
}

function addToTops(jsonTops, tops)
{
    for (const anime of jsonTops.top)
    {
        tops.push(
        {
            rank: anime.rank,
            mal_id: anime.mal_id
        });
    }
}

function getRank(tops, malID)
{
    let found;
    return (found = tops.find(anime =>
    {
        return anime.mal_id === malID;
    })) ? found.rank : Number.MAX_SAFE_INTEGER;
}
