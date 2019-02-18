/**
 * @description - Helper function to post status
 * @param  {string}   body
 * @param  {boolean}  nsfw
 * @param  {Function} callback
 * @return {Function} callback
 */
function sendGabPost(body, nsfw, callback) {
    if (!body) return callback(false, {});
    if (nsfw == undefined || nsfw == null) nsfw = 0;

    var POST_URL = BASE_URI + '/post';

    console.log("SENDING - POST - NOW:", POST_URL, body, nsfw);

    //Perform request to post status
    performRequest({
        method: 'POST',
        url: POST_URL,
        params: {
            body: body,
            nsfw: nsfw
        },
    }, function(error, data) {
        console.log("error, data:", error, data);

        var success = data['success'];

        //If error, check if user is logged in
        if (error || !success) {
            //Check if has successful request
            var user = data['user'];

            if (!user) {
                //Need to log in, make call to log out of extension
                alert('Error 10: You are not logged in to share.gab.com. Please log back in by clicking the "Sign In" button in the Extension\'s popup when this alert dismisses.');

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
                requestGabPostStatus(data);
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
function requestGabPostStatus(originalData) {
    //Must have data
    if (!isObject(originalData)) return false;

    //Get post, id
    var postObject = originalData['post'] || {};
    var postId = postObject['_id'] || '';

    //Must have id
    if (!isString(postId)) return false;

    //Create url to get
    var url = BASE_URI + '/post/' + postId;
    performRequest({
        method: 'GET',
        url: url
    }, function(error, data) {
        //Must have data.post
        if (!isObject(data) || error) {
            alert('Error 4: Unable to post to Gab.com. Please try again.');
            return false;
        }

        //Get data
        var resultPostObject = data['post'] || {};
        var postStatus = resultPostObject['status'] || false;

        //Check status types
        switch (postStatus) {
            case POST_STATUS_PENDING:
                //If still pending, request again in 1s
                setTimeout(function() {
                    requestGabPostStatus(data);
                }.bind(data), 1000);
                break;
            case POST_STATUS_ERROR:
                //Alert error
                alert('Error 2: Unable to post to Gab.com. Please try again.');
                break;
            case POST_STATUS_COMPLETE:
                //If complete, get url and send attempt to send notification
                var url = makeGabPostUrlWithPostData(resultPostObject);

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
 * @description - Make Gab post url with post data
 * @param  {Object} postData
 * @return {String|null}
 */
function makeGabPostUrlWithPostData(postData) {
    //Must be object
    if (!isObject(postData)) return null;

    //Get post data
    var postId = postData['postId'] || '';
    var user = postData['user'] || {};
    var username = user['username'] || '';

    //Must have username, postId
    if (!username || !postId) return null;

    //Create url
    var url = 'https://www.gab.com/' + username + '/posts/' + postId;

    //Return now
    return url;
};
