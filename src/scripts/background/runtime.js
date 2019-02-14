/**
 * @description - Create a new background page
 */
__BROWSER__.browserAction.onClicked.addListener(function() {
    __BROWSER__.tabs.create({ url: 'index.html' });
});

/**
 * @description - Install new context menu onInstall
 */
__BROWSER__.runtime.onInstalled.addListener(function() {
    createContextMenu();
});

/**
 * @description - onMessage Handler for sending messages from elsewhere to this background.js file
 * @returns callback(*)
 */
__BROWSER__.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    var action = message['action'] || '';

    //Check action
    if (action === BACKGROUND_ACTION_LOGOUT) {
        //Clear stotage
        gses.logout();

        var url = BASE_URI + '/logout';

        // Post to log out of extension through url
        performRequest({
            method: 'GET',
            url: url,
        });

        //Send alert
        alert('Successfully logged out of the Gab Share Extension');
    }
    else if (action === BACKGROUND_ACTION_GET_KEY) {
        var key = message.key || '';

        //Key must exist
        if (!key) {
            if (sendResponse) sendResponse(null);
            return true;
        }

        //Get/Send value
        var value = gses.getValue(key);

        if (sendResponse) sendResponse(value);
    }
    else if (action === BACKGROUND_ACTION_SET_KEY) {
        //Get key/value
        var key = message.key || '';
        var value = message.value || '';

        //Must be key
        if (!key) return true;

        //Set value in storage
        gses.setValue(key, value);
    }
    else if (action === BACKGROUND_ACTION_CONTEXT_MENU_ENABLED) {
        var value = message.value;

        //Create or remove
        if (value == true) createContextMenu();
        else {
            //Attempt to remove (may not exist, so try/catch)
            try {
                __BROWSER__.__CONTEXT_MENUS__.remove(CONTEXT_MENU_ID);
            }
            catch (e) { /**/ };
        }

        //Set enabled in storage
        gses.setValue(STORAGE_KEY_CONTEXT_MENU_ENABLED, value);
    }
    else if (action === BACKGROUND_ACTION_POST_STATUS) {
        //
        var body = message.body || '';
        var url = message.url || '';
        var nsfw = message.nsfw;

        //Post now
        postGab(body, url, nsfw, sendResponse);
    }
    else if (action === BACKGROUND_ACTION_LOGGED_IN) {
        gses.setValue(STORAGE_KEY_LOGGED_IN, true);
    }
    else if (action === BACKGROUND_ACTION_VERSION_CHECK) {
        //Check version every 24hr
        var date = new Date();
        var ms = date.getTime();

        //Get existing version value if exists
        var existingVersionValue = gses.getValue(STORAGE_KEY_VERSION);
        if (!isObject(existingVersionValue)) {
            //Set new
            gses.setValue(STORAGE_KEY_VERSION, {
                version: BROWSER_CONFIG.version,
                expiresAt: -1
            });
        }

        //Is object, check if we're past expiresAt date
        var expiresAt = existingVersionValue['expiresAt'] || -1;
        //Don't continue if not past
        if (ms > expiresAt) return true;

        //Make request to get updated version
        var url = BASE_URI + '/version';
        performRequest({
            headers: [
                {
                    key: 'X-GabShare-Host',
                    value: BROWSER_CONFIG.slug
                },
                {
                    key: 'X-GabShare-Version',
                    value: BROWSER_CONFIG.version
                }
            ],
            method: 'GET',
            url: url
        }, function(error, data) {
            if (!isObject(data)) return true;

            //Get version info
            var versionBlock = data['requiredVersion'] || {};
            var versionNumber = versionBlock['version'] || '';

            if (!isString(versionNumber)) return true;

            //Check if is the same
            if (BROWSER_CONFIG.version !== versionNumber) {
                alert("There's an updated version of the Gab Share Extension. Visit https://share.gab.com/download for details.");
            }

            //Set in storage for re-checking in 24 hours
            var expiresAt = ms + ONE_DAY_IN_MS;
            gses.setValue(STORAGE_KEY_VERSION, {
                version: BROWSER_CONFIG.version,
                expiresAt: expiresAt
            });
        });
    }

    //Async
    return true;
});
