/**
 * @description - Popup
 * @return function
 */
var Popup = function() {

    var scope = this;

    //Elements
    var body = document.body;
    var container = document.getElementById('popup');

    var headerAuthBtn = document.getElementById('auth');
    var headerProfilePhoto = document.getElementById('profile-photo');

    var textbox = document.getElementById('post');
    var characterCountElement = document.getElementById('main-post-footer-character-count');
    var nsfwCheckbox = document.getElementById('nsfw-checkbox');
    var tipBlock = document.getElementById('tip-block');
    var tipText = document.getElementById('tip-text');
    var submitBtn = document.getElementById('submit');

    //Set on every popup open
    var currentTabUrl = '';

    //

    //All possible tips
    var tips = [
        'Turn on dark mode in the "<a class="text-color--x3" id="options-page-link">Options</a>" page',
        '<b>Alt + Shift + G</b> then <b>Tab</b>, <b>Enter</b> to instantly post',
        'Highlight any text, right click then <b>"Share to Gab"</b>',
        'Use <b>#hashtags</b> and <b>@mention</b> people',
        'Learn more about this tool by <a class="text-color--x3" id="options-page-link" rel="noreferer noopener" target="_blank">clicking here</a>',
        'Questions, ideas, bugs? Use <b>#GabShareExtension</b>'
    ];


    //Functions


    /**
     * @description - Event listener for clicking on popup - listens for clicks for "options" page link
     */
    body.addEventListener('click', function(event) {
        var target = event.target;
        //If target is "options-page-link" (defined above in tips[])
        if (target.id === 'options-page-link') {
            //Open options page if exists
            if (__BROWSER__.runtime.openOptionsPage) {
                __BROWSER__.runtime.openOptionsPage();
            }
        }

        event.stopPropagation()
    });

    /**
     * @description - Typing in textbox, set character count on type
     */
    textbox.oninput = function() {
        setCharacterCount();
    };

    /**
     * @description - Helper to set character count for text input
     */
    function setCharacterCount() {
        //Get value, length
        var val = textbox.value || '';
        var len = val.length;

        //Set default if 0
        if (len <= 0) len = 0;

        //Set length
        characterCountElement.innerHTML = len;
    };

    /**
     * @description - Set options page theme
     * @function setTheme
     * @param {String} [theme] - light | dark
     */
    function setTheme(theme) {
        if (!theme) return false;
        body.classList = 'theme--' + theme;
    };

    /**
     * @description - Set container class if logged in or not
     * @function setAccountLoggedIn
     * @param {Boolean} loggedIn
     */
    function setAccountLoggedIn(loggedIn) {
        if (loggedIn) {
            container.classList.add('logged-in');
            container.classList.remove('logged-out');
        }
        else {
            container.classList.add('logged-out');
            container.classList.remove('logged-in');
        }
    };

    /**
     * @description - Set tips enabled
     * @function setTipsEnabled
     * @param {Boolean} enabled
     */
    function setTipsEnabled(enabled) {
        if (enabled) tipBlock.classList.remove('hidden');
        else tipBlock.classList.add('hidden');
    };

    /**
     * @description Helper function to get random number
     * @param  {Number} min
     * @param  {Number} max
     * @return {Number}
     */
    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    /**
     * @description - Set is loading or not (like after pressing "Post" or "Sign In")
     * @function setLoading
     * @param {Boolean} enabled
     */
    function setLoading(onOrOff) {
        if (onOrOff) {
            container.classList.add('loading');
            textbox.disabled = true;
            submitBtn.disabled = true;
        }
        else {
            container.classList.remove('loading');
            textbox.disabled = false;
            submitBtn.disabled = false;
            textbox.value = '';
            nsfwCheckbox.checked = false;
        }
    };

    /**
     * @description - On Popup open
     * @param  {string} title - Active tab title
     * @param  {String} url - Active tab title
     */
    function onPopupOpen(title, url) {
        //Set global
        currentTabUrl = url;

        //Create combined value
        var value = title + ' ' + url;

        //Focus on the textbox, set value
        textbox.focus();
        textbox.value = value;
        //Set initial character count
        setCharacterCount()

        //Get random tip to include in the popups
        var rand = randomIntFromInterval(1, tips.length) - 1;
        tipText.innerHTML = tips[rand];
    };

    /**
     * @description - Clicked on headerAuthBtn
     */
    headerAuthBtn.onclick = function() {
        //Check if safari
        if (BROWSER_CONFIG.slug === BROWSER_SAFARI_SLUG) {
            safari.application.activeBrowserWindow.openTab().url = headerAuthBtn.getAttribute('href');
        }
    };

    /**
     * @description - On "submit" button click
     */
    submitBtn.onclick = function() {
        //Validate that there's something in the textbox
        var body = textbox.value || '';
        if (body.length == 0) return alert('Error 7: You cannot post an empty status.');

        //Set loading
        setLoading(true);

        //Send message background to post status
        __BROWSER__.runtime.sendMessage({
            action: BACKGROUND_ACTION_POST_STATUS,
            body: body,
            url: currentTabUrl,
            nsfw: nsfwCheckbox.checked
        }, function(data) {
            if (isObject(data)) {
                var user = data['user'];
                if (!user) setAccountLoggedIn(false);
            }

            //Reset loading
            setLoading(false);
        });
    };


    //Global functions


    /**
     * @description - Init popup on open
     * @function scope.init
     */
    scope.init = function() {

        if (BROWSER_CONFIG.slug === BROWSER_SAFARI_SLUG) {
            var activeWindow = safari.application.activeBrowserWindow;
            var activeTab = activeWindow.activeTab;

            if (!isObject(activeTab)) activeTab = {};

            var title = activeTab.title || '';
            var url = activeTab.url || '';

            //
            onPopupOpen(title, url);
        }
        else {
            //On popup open, get current tab
            __BROWSER__.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {
                if (!tabs) return false;

                //Get active tab
                var activeTab = tabs[0] || {};

                //Get title, url
                var title = activeTab.title || '';
                var url = activeTab.url || '';

                //
                onPopupOpen(title, url);
            });

            //Get config keys from background
            __BROWSER__.runtime.sendMessage({
                action: BACKGROUND_ACTION_GET_KEY,
                key: STORAGE_KEY_ALL
            }, function(data) {
                if (!data) return false;

                //Set defaults
                setTheme(data.theme);
                setTipsEnabled(data.tips_enabled);
                setAccountLoggedIn(data.logged_in);
            });

            //Get current extension version
            __BROWSER__.runtime.sendMessage({
                action: BACKGROUND_ACTION_VERSION_CHECK
            });
        }
    }
};

/**
 * @description - On popup load
 */
document.addEventListener('DOMContentLoaded', function() {
    //Create and init Popup
    var popup = new Popup();
    popup.init();
});
