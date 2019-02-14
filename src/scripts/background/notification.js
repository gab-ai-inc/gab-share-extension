//Globals
var _current_notification_url = null;
var _notification_id = '';

/**
 * @description Helper function to send notification
 * @param  {String} url
 */
function sendNotification(url) {
    //Must have url
    if (!url || !isString(url)) return false;

    //Clear
    clearNotifications();

    //Set global
    _current_notification_url = url;

    //Create new
    __BROWSER__.notifications.create("", {
        type: 'basic',
        iconUrl: '../assets/images/logo/gab-g-128.png',
        title: "Gab Share Extension",
        message: 'Posted to Gab. Click notification to view.'
    }, function() {
        //
    });
};

/**
 * @description - Listener for on notification clock
 */
__BROWSER__.notifications.onClicked.addListener(function(notificationId) {
    //If no notification url, return automatically
    if (!_current_notification_url) return false;

    //Onclick, go to url
    __BROWSER__.tabs.create({
        url: _current_notification_url
    });

    //Reset
    _current_notification_url = null;

    clearNotifications();

    return true;
});

/**
 * @description - Listener for on notification close
 */
__BROWSER__.notifications.onClosed.addListener(function(notificationId) {
    //Reset
    _current_notification_url = null;
});

/**
 * @description - Helper to clear notifications
 */
function clearNotifications() {
    try {
        __BROWSER__.notifications.clear(_notification_id);
        _current_notification_url = null;
    } catch (e) {
        //
    };
};
