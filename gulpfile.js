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

// Edit this to be the path to the plugins folder
// of your local WordPress install.
paths.pluginExport = '/Users/hrothgar/Desktop/wordpress/wp-content/plugins/';

/* ------------------------------------------------------------------------ */
/*
            The way that this works is the following.

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


/* * * * * * * * * * * * * * * * * * * * * * * * *
                TASKS FOR THE VIS
 * * * * * * * * * * * * * * * * * * * * * * * * */

gulp.task('vis-compile-js', () => {
    return gulp.src(paths.visSrc + 'js/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('vb.min.js'))
        // .pipe(uglify())
        .pipe(gulp.dest(paths.visDist))
});

gulp.task('vis-compile-sass', () => {
    return gulp.src(paths.visSrc + 'sass/vb.sass')
        .pipe(sass()) // {outputStyle: 'compressed'}
        .pipe(autoprefixer())
        .pipe(rename('vb.min.css'))
        .pipe(gulp.dest(paths.visDist))
});

gulp.task('vis-build', [
    'vis-compile-js',
    'vis-compile-sass'
    ]);



/* * * * * * * * * * * * * * * * * * * * * * * * *
                TASKS FOR THE PLUGIN
 * * * * * * * * * * * * * * * * * * * * * * * * */

gulp.task('plugin-copy-php', () => {
    return gulp.src(paths.pluginSrc + 'php/**/*')
        .pipe(gulp.dest(paths.pluginDist))
});

gulp.task('plugin-compile-js', () => {
    return gulp.src(paths.pluginSrc + 'js/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('vb-admin.min.js'))
        // .pipe(uglify())
        .pipe(gulp.dest(paths.pluginDist + 'admin/js/'))
});

gulp.task('plugin-copy-templates', () => {
    return gulp.src(paths.pluginSrc + 'includes/*')
        .pipe(gulp.dest(paths.pluginDist + 'admin/js/templates/'))
})

gulp.task('plugin-copy-vendor-js', () => {
    return gulp.src(paths.pluginSrc + 'js/vendor/*')
        .pipe(gulp.dest(paths.pluginDist + 'admin/js/'))
});

gulp.task('plugin-compile-sass', () => {
    return gulp.src(paths.pluginSrc + 'sass/vb-admin.sass')
        .pipe(sass()) // {outputStyle: 'compressed'}
        .pipe(autoprefixer())
        .pipe(rename('vb-admin.min.css'))
        .pipe(gulp.dest(paths.pluginDist + 'admin/css/'))
});

gulp.task('plugin-compile-bootstrap-wrapper-sass', () => {
    return gulp.src(paths.pluginSrc + 'sass/bootstrap-wrapper.sass')
        .pipe(sass()) // {outputStyle: 'compressed'}
        .pipe(autoprefixer())
        .pipe(rename('bootstrap-wrapper.min.css'))
        .pipe(gulp.dest(paths.pluginDist + 'admin/css/'))
});

gulp.task('plugin-copy-vendor-css', () => {
    return gulp.src(paths.pluginSrc + 'sass/vendor/*')
        .pipe(gulp.dest(paths.pluginDist + 'admin/css'))
});

gulp.task('plugin-copy-vis', () => {
    return gulp.src(paths.visDist + '*')
        .pipe(gulp.dest(paths.pluginDist + 'vis/'))
})

gulp.task('plugin-build', [
    'plugin-copy-php',
    'plugin-compile-js',
    'plugin-copy-templates',
    'plugin-copy-vendor-js',
    'plugin-compile-sass',
    'plugin-compile-bootstrap-wrapper-sass',
    'plugin-copy-vendor-css',
    'plugin-copy-vis'
    ]);


/* * * * * * * * * * * * * * * * * * * * * * * * *
                FULL BUILD TASK
 * * * * * * * * * * * * * * * * * * * * * * * * */

gulp.task('build', [
    'vis-build',
    'plugin-build'
    ]);