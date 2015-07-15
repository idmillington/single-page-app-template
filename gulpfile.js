var gulp = require('gulp');
var minifier = require('gulp-uglify/minifier');
var uglify = require('uglify-js')
var react = require('gulp-react');
var htmlreplace = require('gulp-html-replace');
var concat = require('gulp-concat');

var path = {
  HTML_SRC: ['src/index.html'],
  JS_SRC: [],
  JSX_SRC: ['src/jsx/*.jsx', 'src/jsx/**/*.jsx'],

  REACT_LOCAL: 'lib/react.js',
  REACT_CDN: 'https://cdnjs.cloudflare.com/ajax/libs/react/0.13.3/react.js',
  MINIFIED_OUT: 'js/app.min.js',

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
path.ALL_SRC = path.HTML_SRC.concat(path.JSX_SRC);

// ------------------------------------------------------------------------
// Development tasks.
// ------------------------------------------------------------------------

gulp.task('dev', ['transformJSX', 'copyStaticFiles']);
gulp.task('default', ['watch']);

// Creates the non-minified transpiled JS from JSX
gulp.task('transformJSX', function() {
  gulp.src(path.JSX_SRC)
    .pipe(react())
    .pipe(gulp.dest(path.DEV_PATH('js')));
});

// Plain copies of static files.
gulp.task('copyStaticFiles', function(){
  gulp.src(path.HTML_SRC)
    .pipe(gulp.dest(path.DEV_PATH()));
  gulp.src(path.REACT_LOCAL)
    .pipe(gulp.dest(path.DEV_PATH('js')));
});

// Tracks changes and rebuilds.
gulp.task('watch', function(){
  gulp.watch(path.ALL_SRC, ['transformJSX', 'copyStaticFiles']);
});

// ------------------------------------------------------------------------
// Deployment tasks.
// ------------------------------------------------------------------------

gulp.task('dist', ['copyAndReplaceHTML', 'buildJSX']);

// Builds, combines and minifies the React Javascript
gulp.task('buildJSX', function(){
  gulp.src(path.JSX_SRC)
    .pipe(react())
    .pipe(concat(path.MINIFIED_OUT))
    // Work around bug https://github.com/terinjokes/gulp-uglify/issues/98
    .pipe(minifier({}, uglify))
    .pipe(gulp.dest(path.DIST_PATH()));
});

// Copes the HTML, replacing the individual Javascript files with the combined
gulp.task('copyAndReplaceHTML', function(){
  gulp.src(path.HTML_SRC)
    .pipe(htmlreplace({
      'js': path.MINIFIED_OUT,
      'react': path.REACT_CDN
    }))
    .pipe(gulp.dest(path.DIST_PATH()));
});



