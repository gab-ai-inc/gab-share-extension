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

    let promises = [];


    return Promise.all(promises);
});

/**
 * @description - Create gulp task 'fonts'
 */
gulp.task('fonts', () => {
    let promises = [];


    return Promise.all(promises);
});

/**
 * @description - Create gulp task 'images'
 */
gulp.task('images', () => {
    let promises = [];


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

    let promises = [];


    return Promise.all(promises);
});

/**
 * @description - Create gulp task 'manifest'
 */
gulp.task('manifest', () => {
    let promises = [];


    return Promise.all(promises);
});

/**
 * @description - Create gulp task 'html'
 */
gulp.task('html', () => {
    const pug = require('gulp-pug');
    const replace = require('gulp-replace');

    let promises = [];

    return Promise.all(promises);
});


/**
 * @description - Create gulp task 'build' to combine ('images', 'fonts', 'styles', 'scripts', 'manifest', 'html')
 */
gulp.task('build', gulp.series('images', 'fonts', 'styles', 'scripts', 'manifest', 'html'));
