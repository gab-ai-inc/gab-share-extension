/**
 * @description - Options
 */
var Options = function() {

    //Declare scope
    var scope = this;

    //

    var body = document.body;

    //Elements
    var checkboxHideTips = document.getElementById('checkbox_hide-tips');

    var radioThemeDark = document.querySelector(".input-block-item__radio[name='theme'][value='dark']");
    var radioThemeLight = document.querySelector(".input-block-item__radio[name='theme'][value='light']");

    var checkboxContextMenuEnabled = document.getElementById('checkbox_context-menu-enabled');
    var checkboxContextMenuNotifcationEnabled = document.getElementById('checkbox_notification-enabled');

    var logoutBtn = document.getElementById('log-out-btn');


    //Functions


    /**
     * @description - Set options page theme
     * @function setTheme
     * @param {String} theme - light | dark
     */
    function setTheme(theme) {
        if (!theme) return false;
        body.classList = 'theme--' + theme;
    };


    //Listeners


    /**
     * @description - On logout button click
     */
    logoutBtn.onclick = function() {
        //Send message to log out
        __BROWSER__.runtime.sendMessage({
            action: BACKGROUND_ACTION_LOGOUT
        });
    };

    /**
     * @description - On theme item click
     */
    radioThemeLight.onclick = function() {
        //Send message to set theme
        __BROWSER__.runtime.sendMessage({
            action: BACKGROUND_ACTION_SET_KEY,
            key: STORAGE_KEY_THEME,
            value: THEME_LIGHT
        });

        //Set theme of this options page
        setTheme(THEME_LIGHT);
    };

    /**
     * @description - On theme item click
     */
    radioThemeDark.onclick = function() {
        //Send message to set theme
        __BROWSER__.runtime.sendMessage({
            action: BACKGROUND_ACTION_SET_KEY,
            key: STORAGE_KEY_THEME,
            value: THEME_DARK
        });

        //Set theme of this options page
        setTheme(THEME_DARK);
    };

    /**
     * @description - On hide tips enabled
     */
    checkboxHideTips.onchange = function() {
        var value = this.checked;

        //Send message to set popup tips enabled
        __BROWSER__.runtime.sendMessage({
            action: BACKGROUND_ACTION_SET_KEY,
            key: STORAGE_KEY_TIPS_ENABLED,
            value: value
        });
    };

    /**
     * @description - On context menu enabled
     */
    checkboxContextMenuEnabled.onchange = function() {
        var value = this.checked;

        //Send message to set context menu enabled
        __BROWSER__.runtime.sendMessage({
            action: STORAGE_KEY_CONTEXT_MENU_ENABLED,
            value: value
        });
    };

    /**
     * @description - On context menu notifications enabled
     */
    checkboxContextMenuNotifcationEnabled.onchange = function() {
        var value = this.checked;

        //Send message to set context menu notifications enabled
        __BROWSER__.runtime.sendMessage({
            action: BACKGROUND_ACTION_SET_KEY,
            key: STORAGE_KEY_NOTIFICATION_ENABLED,
            value: value
        });
    };

    //Global functions

    /**
     * @description - Function to call on options instantiation
     * @function scope.init
     */
    scope.init = function() {
        //Send message to browser to get config data
        __BROWSER__.runtime.sendMessage({
            action: BACKGROUND_ACTION_GET_KEY,
            key: STORAGE_KEY_ALL
        }, function(data) {
            if (!data) return false;

            //Get theme, set checkboxes
            if (data.theme === THEME_DARK) {
                radioThemeDark.checked = true;
                radioThemeLight.checked = false;
            }
            else {
                radioThemeDark.checked = false;
                radioThemeLight.checked = true;
            }

            //Set current theme
            setTheme(data.theme);

            //Set checkboxes for enabled values
            checkboxHideTips.checked = data.tips_enabled;
            checkboxContextMenuEnabled.checked = data.context_menu_enabled;
            checkboxContextMenuNotifcationEnabled.checked = data.notification_enabled;
        });
    };
};

/**
 * @description - On options DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', function() {
    //Init news options page
    var options = new Options();
    options.init();
});
