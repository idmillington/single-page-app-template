var gulp = require('gulp');
var minifyJS = require('gulp-uglify/minifier');
var minifyCSS = require('gulp-minify-css');
var uglify = require('uglify-js')
var react = require('gulp-react');
var htmlreplace = require('gulp-html-replace');
var concat = require('gulp-concat');
var express = require('express');
var livereload = require('gulp-livereload');
var less = require('gulp-less');

var path = {
  STATIC_SRC: [
    'src/favicon.ico',
    'src/robots.txt',
    'src/humans.txt',
    'src/crossdomain.xml'
  ],
  HTML_SRC: ['src/index.html'],

  JS_SRC: [],
  JSX_SRC: ['src/jsx/*.jsx'],
  MINIFIED_JS_OUT: 'js/app.min.js',

  CSS_SRC: [],
  LESS_SRC: ['src/less/*.less'],
  MINIFIED_CSS_OUT: 'css/app.css',

  LIB_LOCAL: ['lib/*.js'],
  LIB_CDN: [
    '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js',
    '//cdnjs.cloudflare.com/ajax/libs/react/0.13.3/react.min.js'
  ],

  DEV_DEST_PATH: 'out/dev',
  DIST_DEST_PATH: 'out/dist'
};
var _make_path = function(root) {
  return function(subpath) {
    return root + (subpath ? ('/'+subpath) : '');
  };
};
// Path generators
path.DEV_PATH = _make_path(path.DEV_DEST_PATH);
path.DIST_PATH = _make_path(path.DIST_DEST_PATH);
// Aggregate paths
path.ALL_SRC = [].concat(
  path.HTML_SRC,
  path.JSX_SRC,
  path.LESS_SRC,
  path.STATIC_SRC,
  path.JS_SRC,
  path.CSS_SRC
);

// ------------------------------------------------------------------------
// Development tasks.
// ------------------------------------------------------------------------

gulp.task('default', ['dev', 'contentServer', 'reloadServer', 'watch']);

// Builds the dev content without starting any servers.
gulp.task('dev', ['transformJSX', 'transformLess', 'copyDevStaticFiles']);

// Creates the non-minified transpiled JS from JSX
gulp.task('transformJSX', function() {
  gulp.src(path.JSX_SRC)
    .pipe(react())
    .pipe(gulp.dest(path.DEV_PATH('js')))
    .pipe(livereload());
});

// Convert less to css
gulp.task('transformLess', function() {
  gulp.src(path.LESS_SRC)
    .pipe(less())
    .pipe(gulp.dest(path.DEV_PATH('css')))
    .pipe(livereload());
});

// Plain copies of static files.
gulp.task('copyDevStaticFiles', function(){
  gulp.src(path.HTML_SRC)
    .pipe(gulp.dest(path.DEV_PATH()))
    .pipe(livereload());
  gulp.src(path.LIB_LOCAL)
    .pipe(gulp.dest(path.DEV_PATH('js')))
    .pipe(livereload());
  gulp.src(path.STATIC_SRC)
    .pipe(gulp.dest(path.DEV_PATH()))
    .pipe(livereload());
});

// Serve the app via Express
gulp.task('contentServer', function() {
  var server = express();
  server.use(express.static(path.DEV_PATH()));
  server.listen(4000);
});

// Run the live reload server.
gulp.task('reloadServer', function() {
  livereload.listen({basePath: path.DEV_PATH()});
});

// Tracks changes and rebuilds.
gulp.task('watch', function(){
  gulp.watch(path.ALL_SRC, ['dev']);
});

// ------------------------------------------------------------------------
// Deployment tasks.
// ------------------------------------------------------------------------

gulp.task('dist', [
  'copyAndReplaceHTML', 'copyDistStaticFiles', 'buildLess', 'buildJSX'
  ]);

// Builds, combines and minifies the React Javascript
gulp.task('buildJSX', function(){
  gulp.src(path.JSX_SRC)
    .pipe(react())
    .pipe(concat(path.MINIFIED_JS_OUT))
    // Work around bug https://github.com/terinjokes/gulp-uglify/issues/98
    .pipe(minifyJS({}, uglify))
    .pipe(gulp.dest(path.DIST_PATH()));
});

// Convert less to css, combine and minify
gulp.task('buildLess', function() {
  gulp.src(path.LESS_SRC)
    .pipe(less())
    .pipe(concat(path.MINIFIED_CSS_OUT))
    .pipe(minifyCSS())
    .pipe(gulp.dest(path.DIST_PATH()));
});

// Plain copies of static files.
gulp.task('copyDistStaticFiles', function(){
  gulp.src(path.STATIC_SRC)
    .pipe(gulp.dest(path.DIST_PATH()));
});

// Copes the HTML, replacing the individual Javascript files with the combined
gulp.task('copyAndReplaceHTML', function(){
  gulp.src(path.HTML_SRC)
    .pipe(htmlreplace({
      'js': path.MINIFIED_JS_OUT,
      'css': path.MINIFIED_CSS_OUT,
      'libs': path.LIB_CDN
    }))
    .pipe(gulp.dest(path.DIST_PATH()));
});



