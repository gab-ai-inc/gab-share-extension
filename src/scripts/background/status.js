/**
 * @description - Helper function to post status
 * @param  {string}   body
 * @param  {string}   url
 * @param  {boolean}   nsfw
 * @param  {Function} callback
 * @return {Function} callback
 */
function postGab(body, url, nsfw, callback) {
    if (!body || !url) return callback(false, {});

    //Perform request to post status
    performRequest({
        method: 'POST',
        url: BASE_URI,
        params: {
            body: body,
            url: url,
            nsfw: nsfw
        },
    }, function(error, data) {
        var success = data['success'];

        //If error, check if user is logged in
        if (error || !success) {
            //Check if has successful request
            var user = data['user'];

            if (!user) {
                //Need to log in, make call to log out of extension
                alert('Error 9: You are not logged in to share.gab.com. Please log back in by clicking the "Sign In" button in the Extension\'s popup when this alert dismisses.');

                //Clear storage
                gses.logout();
            }
            else {
                //If message, alert it
                var message = data['message'];
                if (message) alert(message);
            }
        }
        else {
            //Check status after 1s
            setTimeout(function() {
                requestGabStatus(data);
            }.bind(data), 1000);
        }

        //Send callback if exists
        if (callback) return callback(data);
    });
};

/**
 * @description - Request Gab post status
 * @param  {Object} originalData
 * @return {Boolean}
 */
function requestGabStatus(originalData) {
    //Must have data
    if (!isObject(originalData)) return false;

    //Get share, id
    var shareObject = originalData['share'] || {};
    var shareId = shareObject['_id'] || '';

    //Must have id
    if (!isString(shareId)) return false;

    //Create url to get
    var url = BASE_URI + '/share/' + shareId;
    performRequest({
        method: 'GET',
        url: url
    }, function(error, data) {
        //Must have data.share
        if (!isObject(data) || error) {
            alert('Error 5: Unable to post to Gab.com. Please try again.');
            return false;
        }

        //Get data
        var resultShareObject = data['share'] || {};
        var postStatus = resultShareObject['status'] || false;

        //Check status types
        switch (postStatus) {
            case POST_STATUS_PENDING:
                //If still pending, request again in 1s
                setTimeout(function() {
                    requestGabStatus(data);
                }.bind(data), 1000);
                break;
            case POST_STATUS_ERROR:
                //Alert error
                alert('Error 1: Unable to post to Gab.com. Please try again.');
                break;
            case POST_STATUS_COMPLETE:
                //If complete, get url and send attempt to send notification
                var url = makeGabPostUrlWithShareData(resultShareObject);

                //Must exist
                if (!url) return false;

                //Send notification
                sendNotification(url);
                break;
            default:
                break;
        };
    });
};

/**
 * @description - Make Gab post url with share data
 * @param  {Object} shareData
 * @return {String|null}
 */
function makeGabPostUrlWithShareData(shareData) {
    //Must be object
    if (!isObject(shareData)) return null;

    //Get share data
    var postId = shareData['postId'] || '';
    var user = shareData['user'] || {};
    var username = user['username'] || '';

    //Must have username, postId
    if (!username || !postId) return null;

    //Create url
    var url = 'https://www.gab.com/' + username + '/posts/' + postId;

    //Return now
    return url;
};
