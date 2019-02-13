const Browser = require('./browser');

//

const chrome = new Browser({
    name: 'Google Chrome',
    slug: 'chrome',
    version: '0.1.0',
    scriptVariableMap: {
    },
    manifestMap: {
    },
});

const firefox = new Browser({
    name: 'Mozilla Firefox',
    slug: 'firefox',
    version: '0.1.0',
    scriptVariableMap: {
    },
    manifestMap: {
    },
});

//

const Browsers = [
    chrome,
    firefox,
];

module.exports = Browsers;
