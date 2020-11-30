function getVAAndCharacterData(vaMalID, createCharacterBubblesFn, createVABubbleFn)
{
    loadTopAnimes(topAnimes =>
    {
        $("#loading-message").hide().text("Retrieving voice actor...").fadeIn();

        $.getJSON(`https://api.jikan.moe/v3/person/${vaMalID}`, json_response =>
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
        // if character has appeared in a previous anime, check this one to see if it is a more popular anime
        // for example, Tanya Degurechaff is in Isekai Quartet and Youjo Senki, but Youjo Senki is going to be ranked
        // while Isekai Quartet won't be
        let charID = roles.character.mal_id,
            pastID = characters.find(char =>
            {
                return char.characterID == charID;
            });
        if (pastID)
        {
            let possiblyMorePopular = getRank(tops, roles.anime.mal_id);
            if (possiblyMorePopular && (!pastID.rank ||  (pastID.rank && possiblyMorePopular < pastID.rank)))
            {
                pastID.rank = possiblyMorePopular;
                pastID.animeID = roles.anime.mal_id;
                pastID.animeStr = roles.anime.name;
            }
            continue;
        }

        characters.push(
        {
            name: switchFirstAndLast(roles.character.name),
            picURL: roles.character.image_url,
            profileURL: roles.character.url,
            animeID: roles.anime.mal_id,
            characterID: charID,
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
        profileURL: json.url,
        japaneseName: json.family_name + " " + json.given_name
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
