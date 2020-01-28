/*global require:true */
(function () {
  'use strict';
  var gulp = require('gulp');
  var uglify = require('gulp-uglify');
  var concat = require('gulp-concat');
  var arenitesrc = require('gulp-arenite-src');
  var shell = require('gulp-shell');

  var build = 'build/';

  gulp.task('docs', function () {
    return gulp.src('gulpfile.js', {read: false})
      .pipe(shell('node_modules/docco/bin/docco -o docs **/js/*.js'));
  });

  gulp.task('min-hash', function () {
    arenitesrc({
        mode: 'dev',
        base: './hash'
      },
      {
        export: 'arenite',
        imports: {module: {module: ''}}
      }, function (src) {
        src
          .pipe(concat('router.min.js'))
          .pipe(uglify({preserveComments: 'some'}))
          .pipe(gulp.dest('hash/' + build));
      });
  });

  gulp.task('min-location', function () {
    arenitesrc({
        mode: 'dev',
        base: './location'
      },
      {
        export: 'arenite',
        imports: {module: {module: ''}}
      }, function (src) {
        src
          .pipe(concat('router.min.js'))
          .pipe(uglify({preserveComments: 'some'}))
          .pipe(gulp.dest('location/' + build));
      });
  });

  gulp.task('default', ['min-hash', 'min-location', 'docs']);

  gulp.task('watch', function () {
    gulp.watch('**/*.js', ['min-hash', 'min-location', 'docs']);
  });
}());
