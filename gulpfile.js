var gulp = require('gulp');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var rename = require("gulp-rename");
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var onError = function (err) {
    console.log(err);
};

/**
 * concatenate and minify js files and write a sourcemap
 */
gulp.task('build-js', function () {
    gulp.src('src/*')
        .pipe(plumber({errorHandler: onError}))
        .pipe(sourcemaps.init())
        .pipe(uglify({preserveComments: 'licence'}))
        .pipe(concat('gameoflife.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
});

/**
 * watch for changes in js-files, then build-js
 */
gulp.task('watch-js', function(){
    gulp.watch('src/**/*.js', ['build-js']);
});

/**
 * perform these tasks when running just 'gulp'
 */
gulp.task('default', ['build-js', 'watch-js']);