const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');

const paths = {
    visSrc:  'vis/src/',
    visDist: 'vis/dist/',
    pluginSrc:  'plugin/src/',
    pluginDist: 'plugin/dist/'
};

paths.visLib = paths.src + 'vis_lib/';
paths.wpPlugin = paths.src + 'wp_plugin/';
paths.wpPluginDist = paths.wpPlugin + 'plugin_dist/';

// Edit this to be the path to the plugins folder
// of your local WordPress install.
paths.pluginExport = '/Users/hrothgar/Desktop/wordpress/wp-content/plugins/';

/* ------------------------------------------------------------------------ */
/*
        Note to me:
            The way that this will work is the following.

            task 'vis-build'
                - compiles js to dist
                - compiles sass to dist

            task 'plugin-build'
                - copies PHP to dist
                - compiles js to appropriate place in dist
                - compiles sass to appropriate place in dist
                - copies results of vis-build to dist (doesn't vis-build)

            task 'plugin-move'
                - moves plugin dist files to local path for testing

            task 'build'
                - does all of the above, in that order
*/

gulp.task('vis-compile-js', () => {
    return gulp.src(paths.visSrc + 'js/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('vb.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.visDist))
});

gulp.task('vis-compile-sass', () => {
    return gulp.src(paths.visSrc + 'sass/vb.sass')
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(autoprefixer())
        .pipe(rename('vb.min.css'))
        .pipe(gulp.dest(paths.visDist))
});

gulp.task('vis-build', ['vis-compile-js', 'vis-compile-sass']);




// gulp.task('')


// gulp.task('plugin-copy', () => {
//     return gulp.src([paths.wpPluginDist + '**/*'])
//                .pipe(gulp.dest(paths.pluginExport + 'visualbudget/'));
// });