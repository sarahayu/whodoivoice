firebase.initializeApp(
{
    apiKey: "AIzaSyBeWnUFPxySkPCuw-cmWMpJXi3TmutBopg",
    authDomain: "anime-site-7964a.firebaseapp.com",
    databaseURL: "https://anime-site-7964a.firebaseio.com",
    projectId: "anime-site-7964a",
    storageBucket: "anime-site-7964a.appspot.com",
    messagingSenderId: "778668092530",
    appId: "1:778668092530:web:3b8034da272cd62ff266eb",
    measurementId: "G-FDHXQDVPNC"
});
firebase.analytics();

function loadTopAnimes(createCharactersFn)
{
    $("#loading-message").hide().text("Getting data...").fadeIn();

    firebase.database().ref("tops").once("value").then(response =>
    {
        createCharactersFn(response.val());
        updateTops(response.val())
    }, error =>
    {
        console.log(error);
    });
}

function updateTops(tops)
{
    let latest = 0;
    for (const top of tops)
        if (top.updated > latest) latest = top.updated;

    if ((Date.now() - latest) / 1000 / 60 / 60 / 24 > 7)
    {
        console.log(atob("cG9n"));
        let newTops = [];
        retrieveTops(10, newTops, Date.now(), newTopAnimus =>
        {
            firebase.database().ref("tops").set(newTopAnimus, error =>
            {
                if (error)
                    console.log(error);
            });
        })
    }
}

function retrieveTops(page, tops, timestamp, updateFn)
{
    let url = `https://api.jikan.moe/v3/top/anime/${page}/bypopularity`;
    if (page == 1)
        $.getJSON(url, response =>
        {
            tops.push(...parseTopsFromJSON(response, timestamp));
            updateFn(tops);
        })
    else
        $.getJSON(url, response =>
        {
            tops.push(...parseTopsFromJSON(response, timestamp));
            setTimeout(() =>
            {
                retrieveTops(page - 1, tops, timestamp, updateFn);
            }, 1000);
        })
}

function parseTopsFromJSON(json, timestamp)
{
    let tops = [];
    for (const top of json.top)
        tops.push(
        {
            mal_id: top.mal_id,
            rank: top.rank,
            updated: timestamp
        });
    return tops;
}
