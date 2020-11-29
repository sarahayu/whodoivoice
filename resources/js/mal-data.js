function getVAAndCharacterData(createCharacterBubblesFn, createVABubbleFn)
{
    loadTopAnimes(topAnimes =>
    {
        $("#loading-message").hide().text("Retrieving voice actor...").fadeIn();

        $.getJSON("resources/json/test_va_response.json", json_response =>
        {
            let characters = parseCharactersFromJSON(json_response, topAnimes);
            createCharacterBubblesFn(characters);
            createVABubbleFn(parseVAFromJSON(json_response));
        });
    });
}

function parseCharactersFromJSON(json, tops)
{
    let ids = [],
        characters = []
    for (const roles of json.voice_acting_roles)
    {
        // if character has appeared in a previous anime, skip
        let id = roles.character.mal_id;
        if (ids.includes(id)) continue;
        else ids.push(id);

        characters.push(
        {
            name: switchFirstAndLast(roles.character.name),
            picURL: roles.character.image_url,
            profileURL: roles.character.url,
            animeID: roles.anime.mal_id,
            characterID: roles.character.mal_id,
            animeStr: roles.anime.name,
            rank: getRank(tops, roles.anime.mal_id)
        });
    }

    characters.sort((first, second) =>
    {
        return (first.rank ? first.rank : Number.MAX_SAFE_INTEGER) -
            (second.rank ? second.rank : Number.MAX_SAFE_INTEGER);
    });

    return characters;
}

function parseVAFromJSON(json)
{
    return {
        name: json.name,
        picURL: json.image_url,
        profileURL: json.url
    };
}

function getRank(tops, malID)
{
    let found = tops.find(anime =>
    {
        return anime.mal_id === malID;
    });
    
    return found ? found.rank : found;
}

function switchFirstAndLast(name)
{
    let commaIndex = name.search(', ');
    if (commaIndex != -1)
        name = `${name.substring(commaIndex + 2)} ${name.substring(0, commaIndex)}`;
    return name;
}
