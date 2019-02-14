//Modules
const gulp = require('gulp');
const fs = require('fs');

//Config
const Browsers = require('./config/browsers');
const manifest = require('./config/manifest');


//


/**
 * @description - Get files from directory
 * @param {String} dir - Directory
 * @param {String} fileType - File type to filter
 * @param {Array} fileArray - File array (recursive)
 * @return {Array} fileArray
 */
let getFiles = (dir, fileType, fileArray) => {
    //Get or create fileArray
    fileArray = fileArray || [];
    //Read directory
    let files = fs.readdirSync(dir);

    //Cycle files
    for (let i in files) {
        let file = files[i];

        //Must be string
        if (typeof file === 'string' || file instanceof String) {

            //Get file name
            let name = dir + '/' + files[i];
            name = name.toString();

            //Check if is folder or not
            if (isFolder(name)) {
                //Recursive file array loop until we're done
                getFiles(name, fileType, fileArray);
            }
            else {
                //Not a folder, check extension, if matches, push to file array
                if (getExtension(name) == `.${fileType}`) fileArray.push(name);
            }
        }
    };

    //Return now
    return fileArray;
};

/**
 * @description - Is path a folder
 * @param  {String} filePath - Path to check
 * @return {Boolean} isFolder
 */
let isFolder = (filePath) => {
    try {
        return fs.statSync(filePath).isDirectory();
    } catch (err) {
        return false;
    }
};

/**
 * @description - Get extension
 * @param  {String} filename - File name
 * @return {String} extension
 */
let getExtension = (filename='') => {
    let i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i);
};


//


/**
 * @description - Create gulp task 'styles'
 */
gulp.task('styles', function () {
    //Modules
    const sass = require('gulp-sass');
    const cleanCSS = require('gulp-clean-css');
    const sourcemaps = require('gulp-sourcemaps');
    const concat = require('gulp-concat');
    const gulpif = require('gulp-if');
    const postcss = require('gulp-postcss');
    const autoprefixer = require('autoprefixer');
    const wait = require('gulp-wait');

    function getPromise(fileName, savePath) {
        return new Promise((resolve, reject) => {
            gulp
                .src([
                    'src/styles/index.scss',
                    `src/styles/components/${fileName}.scss`,
                ])
                .pipe(wait(500))
                .pipe(concat(`${fileName}.css`))
                .pipe(sass())
                .pipe(postcss([autoprefixer()]))
                .pipe(cleanCSS())
                .pipe(gulp.dest(`${savePath}/${fileName}`))
                .on('error', err => {
                    reject(err);
                }).on('end', () => {
                    resolve();
                });
        });
    };

    let promises = [];

    for (let i = 0; i < Browsers.length; i++) {
        let browser = Browsers[i];

        promises.push(getPromise('popup', browser.path));
    };

    return Promise.all(promises);
});

/**
 * @description - Create gulp task 'fonts'
 */
gulp.task('fonts', () => {
    let promises = [];

    for (let i = 0; i < Browsers.length; i++) {
        let browser = Browsers[i];

        let path = `${browser.path}/assets/fonts`;

        let promise = new Promise((resolve, reject) => {
            gulp
                .src(['src/fonts/**/**'])
                .pipe(gulp.dest(path))
                .on('error', err => {
                    reject(err);
                }).on('end', () => {
                    resolve();
                });
        });

        promises.push(promise);
    };

    return Promise.all(promises);
});

/**
 * @description - Create gulp task 'images'
 */
gulp.task('images', () => {
    let promises = [];

    for (let i = 0; i < Browsers.length; i++) {
        let browser = Browsers[i];

        let path = `${browser.path}/assets/images`;

        let promise = new Promise((resolve, reject) => {
            gulp
                .src(['src/images/**/**'])
                .pipe(gulp.dest(path))
                .on('error', err => {
                    reject(err);
                }).on('end', () => {
                    resolve();
                });
        });

        promises.push(promise);
    };

    return Promise.all(promises);
});

/**
 * @description - Create gulp task 'scripts'
 */
gulp.task('scripts', () => {
    const concat = require('gulp-concat');
    const uglify = require('gulp-uglify');
    const replace = require('gulp-replace');
    const insert = require('gulp-insert');

    function getPromise(fileName, findPath, browser, pathSuffix) {
        let browserConfig = JSON.stringify(browser);
        let savePath = browser.path;
        if (pathSuffix) savePath += `/${pathSuffix}`;

        return new Promise((resolve, reject) => {
            gulp
                .src(
                    [
                        'src/scripts/utils/**',
                        findPath,
                    ]
                )
                .pipe(concat(`${fileName}.js`))
                .pipe(insert.prepend(`var BROWSER_CONFIG = ${browserConfig};`))
                .pipe(replace('__BROWSER__', browser.scriptVariableMap.BROWSER))
                .pipe(replace('__CONTEXT_MENUS__', browser.scriptVariableMap.CONTEXT_MENUS))
                .pipe(uglify({
                    mangle: {
                        toplevel: true,
                    },
                }))
                .pipe(gulp.dest(`${savePath}/${fileName}`))
                .on('error', err => {
                    reject(err);
                }).on('end', () => {
                    resolve();
                });
        });
    };

    let promises = [];

    for (let i = 0; i < Browsers.length; i++) {
        let browser = Browsers[i];

        promises.push(getPromise('popup', 'src/scripts/components/popup.js', browser));
    };

    return Promise.all(promises);
});

/**
 * @description - Create gulp task 'manifest'
 */
gulp.task('manifest', () => {
    let promises = [];

    for (let i = 0; i < Browsers.length; i++) {
        let browser = Browsers[i];

        let path = `${browser.path}`;

        //Get manifest and input browser keys
        let str = JSON.stringify(manifest);
        str = str.replace(/__CONTEXT_MENUS__/g, browser.scriptVariableMap.CONTEXT_MENUS);

        let thisManifest = JSON.parse(str);
        thisManifest = Object.assign(browser.manifestMap, thisManifest);

        let promise = new Promise(function(resolve, reject) {
            fs.writeFile(`${path}/manifest.json`, JSON.stringify(thisManifest), function(err) {
               if (err) reject(err);
               else resolve();
            });
        });

        promises.push(promise);
    };

    return Promise.all(promises);
});

/**
 * @description - Create gulp task 'html'
 */
gulp.task('html', () => {
    const pug = require('gulp-pug');
    const replace = require('gulp-replace');

    function getPromise(fileName, browser) {
        return new Promise((resolve, reject) => {
            gulp
                .src(`src/views/${fileName}.pug`)
                .pipe(replace('__BROWSER_NAME__', browser.name))
                .pipe(replace('__VERSION__', browser.version))
                .pipe(pug({
                    name: `${fileName}.html`,
                    verbose: true,
                }))
                .pipe(gulp.dest(`${browser.path}/${fileName}`))
                .on('error', err => {
                    reject(err);
                }).on('end', () => {
                    resolve();
                });
        });
    }

    let promises = [];

    for (let i = 0; i < Browsers.length; i++) {
        let browser = Browsers[i];

        promises.push(getPromise('popup', browser.path));
    };

    return Promise.all(promises);
});


/**
 * @description - Create gulp task 'build' to combine ('images', 'fonts', 'styles', 'scripts', 'manifest', 'html')
 */
gulp.task('build', gulp.series('images', 'fonts', 'styles', 'scripts', 'manifest', 'html'));
