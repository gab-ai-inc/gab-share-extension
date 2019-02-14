window.addEventListener("message", function(event) {
    //Must have event, data
    if (!event) return false;
    if (!event.data) return false;

    //Get data
    var data = event.data || {};
    var eventDataType = data['type'] || '';

    //Find message data type
    switch (eventDataType) {
        case MESSAGE_AUTH_RESULT:
            //If error, alert
            if (data.result !== 'success' || data.user === null) {
                return alert('Error 8: Unable to connect to share.gab.com. Please try again.');
            }

            //Get user
            var user = data['user'];

            //Send message to background to authorize
            __BROWSER__.runtime.sendMessage({
                action: BACKGROUND_ACTION_LOGGED_IN,
                data: user
            });

            break;
        case MESSAGE_CLOSE_WINDOW:
            //Attempt to close window, doesn't work on some browsers
            window.close();
            break;
        default:
            break;
    };

    //
    return true;
});
