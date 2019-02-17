var TWEET_LOCATION_TIMELINE = 'timeline';
var TWEET_LOCATION_MODAL = 'modal';

/**
 * @description - Gab Share Extension - Twitter content script
 */
var GSETwitter = function() {
    //Global scope
    var scope = this;

    //Placeholder that contains element info
    var postBlocksAndBtns = [];

    /**
     * @description - Finds and saves the buttons, textboxes on twitter
     * @function fetchElements
     * @return {Boolean} success
     */
    function fetchElements() {
        //Main, single tweet
        var mainBtn = document.querySelector('.TweetBoxToolbar .TweetBoxToolbar-tweetButton.tweet-button .tweet-action.js-tweet-btn');
        var mainTextboxQuerySelector = '#timeline .timeline-tweet-box .home-tweet-box .tweet-form .tweet-content #tweet-box-home-timeline.tweet-box.rich-editor[aria-labelledby="tweet-box-home-timeline-label"]';
        var mainTextbox = document.querySelector(mainTextboxQuerySelector);
        if (mainBtn && mainTextbox) {
            //Append to list
            postBlocksAndBtns.push({
                btn: mainBtn,
                location: TWEET_LOCATION_TIMELINE,
                textbox: mainTextbox,
                textboxQuerySelector: mainTextboxQuerySelector,
            });
        }

        //Open modal, single tweet
        var modalBtn = document.querySelector('.TweetBoxToolbar .TweetBoxToolbar-tweetButton .buttons .SendTweetsButton.js-send-tweets');
        var modalTextboxQuerySelector = '.modal-body .tweet-box.rich-editor';
        var modalTextbox = document.querySelector(modalTextboxQuerySelector);
        if (modalBtn && modalTextbox) {
            //Append to list
            postBlocksAndBtns.push({
                btn: modalBtn,
                location: TWEET_LOCATION_MODAL,
                textbox: modalTextbox,
                textboxQuerySelector: modalTextboxQuerySelector
            });
        }

        //Success
        return true;
    };

    /**
     * @description - Helper to add Tweet + Gab buttons to page
     * @function addBtns
     * @returns {Boolean} success
     */
    function addBtns() {
        //If no array, return now
        if (!isArray(postBlocksAndBtns)) return false;

        //Cycle blocks
        for (var i = 0; i < postBlocksAndBtns.length; i++) {
            var block = postBlocksAndBtns[i];

            //Must be object
            if (!isObject(block)) continue;

            var btn = block.btn;
            var textbox = block.textbox;

            //Must exist
            if (!btn || !textbox) continue;

            //Clone btns
            var newBtn = cloneTweetBtn(btn);
            //Must exist
            if (!newBtn) continue;

            //Add event listener for clicking
            newBtn.addEventListener('click', function(block) {
                //Send gab with block
                sendTweetToGab(block)
                //Click btn to send if is timeline tweeter (for modal it works if we just click "Tweet + Gab")
                if (block.location === TWEET_LOCATION_TIMELINE) {
                    block.btn.click();
                }
            }.bind(null, block));

            //Append to parent, next to other btn
            var parent = btn.parentNode;
            if (!parent) continue;
            parent.appendChild(newBtn);
        };

        return true;
    };

    /**
     * @description - Helper to clone tweet btn with Gab style
     * @function cloneTweetBtn
     * @param  {Node} btn
     * @return {Node} newBtn
     */
    function cloneTweetBtn(btn) {
        if (!btn) return null;

        var newBtn = btn.cloneNode(true);

        //Change title
        newBtn.querySelector('.button-text').innerHTML = "Tweet + Gab";
        //Gab colors
        newBtn.style.setProperty("background-color", COLOR_GAB, "important");
        newBtn.style.setProperty("color", "#fff", "important");
        //Offset
        newBtn.style.setProperty("margin-left", '10px', "important");
        //Set enabled
        newBtn.removeAttribute('disabled');
        newBtn.classList.remove('disabled');

        return newBtn;
    };

    /**
     * @description - Helper to send tweet block to gab
     * @function sendTweetToGab
     * @param  {Object} block - From postBlocksAndBtns
     * @return {Boolean}
     */
    function sendTweetToGab(block) {
        //Must be object
        if (!isObject(block)) return false;

        //Get querySelector
        var textboxQuerySelector = block.textboxQuerySelector;
        //Sanitze field
        var text = sanitizeTextboxContent(textboxQuerySelector);

        //Must have text
        if (!text || text === '' || text === null) return false;

        //Send message background to post status
        __BROWSER__.runtime.sendMessage({
            action: BACKGROUND_ACTION_SEND_POST,
            body: text,
        }, function(data) {
            //
        });
    };

    /**
     * @description - Sanitize textbox content
     * @param  {String} textboxSelector
     * @return {String} text
     */
    function sanitizeTextboxContent(textboxSelector) {
        //Must exist
        if (!textboxSelector) return null;

        //Get textbox
        var textbox = document.querySelector(textboxSelector);
        //Must exist
        if (!textbox) return null;

        //Get basic content, no html
        var text = textbox.textContent;

        //Return now
        return text;
    };

    //Global functions


    /**
     * @description - Init script on open
     * @function scope.init
     */
    scope.init = function() {
        fetchElements();
        addBtns();
    };
};

//Wait for page to be ready and loaded
ready(function() {
    //Delay a bit
    setTimeout(function () {
        //Init new script
        var gset = new GSETwitter();
        gset.init();
    }, 150);
});
