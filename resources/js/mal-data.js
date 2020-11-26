function populateCharacterData(createBubblesFn)
{
    loadTopAnimes(topAnimes =>
    {
        $("#loading-message").hide().text("Retrieving voice actor...").fadeIn();

        rankings = topAnimes;

        $.getJSON("resources/json/test_va_response.json", json_response =>
        {
            let characters = createCharactersFromJSON(json_response, topAnimes);
            createBubblesFn(characters);
        });
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

        characters.push(
        {
            name: switchFirstAndLast(roles.character.name),
            picURL: roles.character.image_url,
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
    })) ? found.rank : found;
}

function switchFirstAndLast(name)
{
    let commaIndex = name.search(', ');
    if (commaIndex != -1)
        name = `${name.substring(commaIndex + 2)} ${name.substring(0, commaIndex)}`;
    return name;
}
