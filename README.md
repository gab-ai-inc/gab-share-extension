# Gab.com Browser Share Extension

This repository holds the Gab.com Browser Share Extension code that is used to generate the final distribution code per each browser.

# • Installation

Latest version: 0.1.0

This share extension only requires developer dependencies.

Clone or download the repository and then:
`$ npm install`

# • Overview

This is meant to help anyone understand this repository, where everything lives and what everything does.

## • Details

This extension is comprised of a configuration class (`Browser`) and its corresponding extension files. The extension files follow the standard browser extension layout: `manifest`, `popup`, `background`, `options`, `content scripts` and other related browser API's to connect them all.

For more information regarding the understanding of how browser extension source code is formatted please visit: https://developer.chrome.com/extensions/getstarted or https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons

Chrome, Firefox, and Microsoft edge share nearly identical browser extension API's. Within the following sections, we'll touch upon shared code and how we use `gulp`, an automation toolkit, to inject the configuration class (`Browser`) specific variables into the code base in order to achieve the final distribution code per each browser.

Safari browser extensions can be created via Extension Builder and by following "Chrome Extension Porting" instructions detailed here: https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/SafariExtensionsConversionGuide/Chapters/Chrome.html.  For the most part however, Safari extensions contain similar code to the previously mentioned browsers. As for the Gab.com Browser Share Extension, a Safari implementation is currently in progress.

## • Code

The code is split into the configuration and source folders.

### • Configuration (`./config`)

The configuration files contain the Browser class (`browser.js`), browsers that implement the Browser class (`browsers.js`) and the manifest file (`manifest.js`) that all browser extensions rely on.

The Browser class contains information that the _Build Process_ uses. Aside from `name`, `slug`, `version`, and `path`, the `manifestMap` and `scriptVariableMap` are what we use to customize the source code and manifest.

___
#### • `manifestMap`

The `manifestMap` is an `object` that contains key/value content that is used to inject into the `manifest` file. Within the `gulp:manifest` function, we grab the `./config/manifest.js` file, clone it, convert to JSON then inject the `browser.manifestMap` object into it.

This is necessary because each browser may require seperate key/values or, are simply just named differently.

___
#### • `scriptVariableMap`

The `scriptVariableMap` is an `object` that contains key/value content that is used to define browser specific variables using general variable names.

The existing values that we use are:

| Name | Variable | Definition |
| --- | --- | --- |
`BROWSER` | `__BROWSER__` | Defines the variable for "browser" per browser API requirements
`CONTEXT_MENUS` | `__CONTEXT_MENUS__` | Defines the variable for "context menus" per browser API requirements
`MESSENGER` | `__MESSENGER__` | Defines the variable for "runtime" per browser API requirements

Each of these variables in the `scriptVariableMap` are used within the _Build Process_ to find and replace throughout the code. This enables us to write 1 (one) shared codebase for all of these browser extensions by just writing generic variable names such as `__BROWSER__` and within the `gulp` process, using the `Browser` class, we replace all occurences within each source file.

Example:

```javascript
//Before
__BROWSER__.browserAction.onClicked.addListener(function() {
    // some code here...
});
```

Running the `gulp:scripts` function provides the following output for example:

```javascript
//After
myCustomBrowserVariable.browserAction.onClicked.addListener(function() {
    // some code here...
});
```

### • Source (`./src`)

The source files contain folders for `fonts`, `images`, `scripts`, `styles` and `views`.

___
#### • Fonts (`./src/fonts`)

Gab.com uses the Helvetica Neue font. The `normal` and `bold` font styles (.woff files) are included via the `typography.scss` file (`./src/styles/partials/typography.scss`).

___
#### • Images (`./src/images`)

The images are split up between `icons` and `logo`. The images are used within some of the `styles` and `views` files.

___
#### • Scripts (`./src/scripts`)

We're using vanilla `javascript` for these files. We don't use any module bundlers anything for this other than `uglifcation`.
The scripts are seperated between `background`, `components`, `content` and `utils`.

| Folder | Files | Usage |
| --- | --- | --- |
`background` | Contains files used for the background
`components` | Contains `popup.js` and `options.js`
`content` | Contains files for the `content_scripts` (see: manifest)
`utils` | Contains shared code helpers

The scripts are split up during the build process between: `background.js`, `options.js`, `popup.js` and each of the `content` `content_scripts`. Each of those files do not contain each other but, they do however contain all of the `util` directory files.

___
#### • Styles (`./src/styles`)

We use `scss` for our styles.

The style files are split up using a standard `scss` organizational structure of `components`, `modules`, and `partials`.
During the build process each of the components (currently only: `popup.scss` and `options.scss`) contain all of the `modules` and `partials` styles. The components do not share code between themselves.

___
#### • Views (`./src/views`)

We use `pug` (https://pugjs.org) for each of the `views` files.

| File | Usage |
| --- | --- |
`background.pug` | Simple file that just includes the final `background.js` script.
`options.pug` | Lays out the Options page content for configuration, learning, contact and more of the extension.
`popup.pug` | The primary file that contains the functionality to compose a new gab and share it.


# • Build Process

The build process uses each `Browser` class object defined in `./config/browsers.js` to automatically build `scripts`, `styles`, `html`, `manifest`, `images`, and `fonts`  into the `./build` directory (_hidden_). The gulp scripts compile, minify (& mangle) and save the combined files in these `./build` directories.

Each of those scripts can be run using npm.

For example:

```
$ npm run gulp:scripts
$ npm run gulp:styles
$ npm run gulp:html
$ npm run gulp:manifest
$ npm run gulp:images
$ npm run gulp:fonts
```

You can also run all of them at once using the gulp `build` function:

```
$ npm run build
```

During the build process, all of the code in the `./src` directory is compiled into the `./build` directory. The `./build` directory will contain folders named after each of the `Browser` class `slug` (`browser.slug` ... i.e. `chrome`, `firefox`, etc.). Each of the folders contain browser specific extension code formatted in a specific way that is read by the main `manifest.json` in each of the folder's directories. For example, the `popup`, `images`, `background`, `content_scripts`, `options` and other related `manifest.json` keys are transfered from the `./src` directory into the `./build/*` folders.

# • Todo

- Add a Gab button within Twitter compose box
- Replace Twitter share intent buttons on all webpages with a Gab share intent button
- Safari browser implementation
- Microsoft Edge browser implementation

# • License

MIT License

Copyright (c) 2019 Gab AI, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
