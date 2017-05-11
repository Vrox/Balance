/* globals require */
const gulp   = require('gulp');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const notify = require('gulp-notify');
const babel  = require('gulp-babel');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserifyShader = require('browserify-shader');

gulp.task( 'default', function() {

  var b = browserify({
    entries: './js/index.js'
  });

  b.transform(browserifyShader, {
//    module: "es6"
  });

  // bundle all our files into one files
  // converts it to a node.js stream
  b.bundle()
    // convert node.js stream to vinyl stream
    .pipe( source('app.js'))
    // convert from chunked stream to buffered 'stream'
    .pipe( buffer() )
    .pipe( babel({ presets:['es2015'] }) )
  //  .pipe( uglify() )
    .pipe( gulp.dest('./dist') )
    .pipe( notify({
      message: 'build complete.',
      onLast: true
    }));
});

gulp.task( 'watch', function() {
  gulp.watch( './js/**.js', function() {
    gulp.run('default');
  });
});
