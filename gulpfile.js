var babel = require("gulp-babel");
var concat = require('gulp-concat');
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var rename = require("gulp-rename");
var rollup = require('gulp-rollup');
var rollupIncludePaths = require('rollup-plugin-includepaths');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var onError = function (err) {
    console.log(err);
};

var includePathOptions = {
    paths: ['src']
};

/**
 * concatenate and minify js files and write a sourcemap
 */
gulp.task('build-js', function () {
    gulp.src('src/gameoflife.js')
        .pipe(plumber({errorHandler: onError}))
        .pipe(rollup({
            sourceMap: true,
            format: 'iife',
            moduleName: 'GameOfLife',
            banner: `//  GameOfLife JavaScript Plugin v1.0.0
            //  https://github.com/barryvanveen/gameoflife
            //
            //  Released under the MIT license
            //  http://choosealicense.com/licenses/mit/`,
            plugins: [
                rollupIncludePaths(includePathOptions)
            ]
        }))
        .pipe(babel({presets: ['es2015']}))
        .pipe(rename('gameoflife.min.js'))
        .pipe(sourcemaps.write('.'))
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