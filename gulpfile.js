var babel = require("gulp-babel");
var gulp = require('gulp');
var rename = require("gulp-rename");
var rollup = require('rollup-stream');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

/**
 * concatenate and minify js files and write a sourcemap
 */
gulp.task('build-js', function () {
    rollup({
            entry: './src/gameoflife.js',
            sourceMap: true,
            format: 'iife',
            moduleName: 'GameOfLife',
            banner: `//  GameOfLife JavaScript Plugin v1.1.0
//  https://github.com/barryvanveen/gameoflife
//
//  Released under the MIT license
//  http://choosealicense.com/licenses/mit/`
        })

        // print errors to console, this makes sure Gulp can keep watching and running
        .on('error', e => {
            console.error(`${e.stack}`);
        })

        // point to the entry file
        .pipe(source('gameoflife.js', './src'))

        // buffer the output, needed for gulp-sourcemaps
        .pipe(buffer())

        // tell gulp-sourcemaps to load the inline sourcemap produced by rollup-stream
        .pipe(sourcemaps.init({loadMaps: true}))

        // compile es2015 into plain javascript
        .pipe(babel({presets: ['es2015']}))

        // rename output file
        .pipe(rename('gameoflife.min.js'))

        // write source map
        .pipe(sourcemaps.write('.'))

        // output to /dist
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