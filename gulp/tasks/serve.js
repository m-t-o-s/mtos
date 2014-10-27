'use strict';

var gulp = require('gulp');
var server = require('gulp-express');
//var server = require('../../server');

module.exports = gulp.task('serve', function (next) {
  server.run({
    file: './server'
  });
  gulp.watch('./server/**/*', server.run)
  gulp.watch('./build/**/*', server.notify)

  return gulp.src('');
});
