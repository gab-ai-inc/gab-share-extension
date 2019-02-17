/**
 * @description Helper function to create ContextMenu
 */
function createContextMenu() {
    //Remove all first
    __BROWSER__.__CONTEXT_MENUS__.removeAll();

    //Create new now
    __BROWSER__.__CONTEXT_MENUS__.create({
        id: CONTEXT_MENU_ID,
        title: "Share to Gab",
        type: "normal",
        contexts: ["page", "selection"]
    });

    //Use onClick handler
    __BROWSER__.__CONTEXT_MENUS__.onClicked.addListener(onContextMenuClick);
};

/**
 * @description - On context menu click handler
 * @param  {Object} info
 * @param  {Object} tab
 */
function onContextMenuClick(info, tab) {
    //Check referering menu id
    if (info.menuItemId === CONTEXT_MENU_ID && isObject(tab) && isObject(info)) {
        //Get current tab information
        var title = tab.title || '';
        var url = tab.url || '';

        //Create combined value
        var body = title + ' ' + url;

        //Get selection if any exist
        var selection = info.selectionText || '';
        //Prepend to value if exists
        if (selection) body = selection + ' - ' + body;

        //Default
        var nsfw = 0;

        //Post status
        //Send message background to post status
        sendGabShare(body, url, nsfw);
    }
};
