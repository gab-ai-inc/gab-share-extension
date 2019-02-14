const Browser = require('./browser');

//

const chrome = new Browser({
    name: 'Google Chrome',
    slug: 'chrome',
    version: '0.1.0',
    scriptVariableMap: {
        BROWSER: 'chrome',
        CONTEXT_MENUS: 'contextMenus',
        MESSENGER: 'extension',
    },
    manifestMap: {
        "options_page": "options/options.html",
        "background.persistent": false,
        "incognito": "not_allowed",
        "offline_enabled": false,
        "version_name": "0.1.0",
    },
});

const firefox = new Browser({
    name: 'Mozilla Firefox',
    slug: 'firefox',
    version: '0.1.0',
    scriptVariableMap: {
        BROWSER: 'browser',
        CONTEXT_MENUS: 'menus',
        MESSENGER: 'runtime',
    },
    manifestMap: {
        "options_ui": {
            "page": "options/options.html",
            "browser_style": true,
        },
    },
});

//

const Browsers = [
    chrome,
    firefox,
];

module.exports = Browsers;
