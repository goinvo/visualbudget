const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');

const paths = {
    src: 'src/',
    dist: 'dist/'
};

paths.visLib = paths.src + 'vis_lib/';
paths.wpPlugin = paths.src + 'wp_plugin/';
paths.wpPluginDist = paths.wpPlugin + 'plugin_dist/';


gulp.task('vis-compile-js', () => {
    return gulp.src(paths.visLib + 'js/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('vb.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist + 'vis/'))
        .pipe(gulp.dest(paths.wpPluginDist + 'vis/'));
});

gulp.task('vis-compile-sass', () => {
    return gulp.src(paths.visLib + 'sass/vb.sass')
        .pipe(sass())
        .pipe(autoprefixer())
})

gulp.task('vis', ['vis-compile-js']);