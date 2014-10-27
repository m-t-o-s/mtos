'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');

module.exports = gulp.task('default', function () {
  if (release) {
    runSequence(
      'clean',
      ['index', 'styles', 'images', 'assets', 'templates', 'lint'],
      'browserify',
      'manifest',
      ['minify', 'serve'],
      'protractor-webdriver',
      'protractor'
    );
  } else {
    runSequence(
      'clean',
      ['index', 'styles', 'images', 'assets', 'cordova', 'templates', 'lint'],
      //'protractor-webdriver',
      'watchify',
      'serve',
      'watch'
      //[//'watchify', 'watch']
    );
  }
});
