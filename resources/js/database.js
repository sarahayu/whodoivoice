function loadTopAnimes(createCharactersFn)
{
    $("#loading-message").hide().text("Getting data...").fadeIn();

    firebase.database().ref("tops").once("value").then(response =>
    {
        createCharactersFn(response.val());
    }, error =>
    {
        console.log(error);
    });
}