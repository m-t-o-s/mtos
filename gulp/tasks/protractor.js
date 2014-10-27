'use strict';

var gulp = require('gulp');
var wait = require('gulp-wait')
var protractor = require("gulp-protractor").protractor;

module.exports = gulp.task('protractor', function (next) {
  return gulp.src(["./tests/protractor/**/*.js"])
  .pipe(wait(750))
  .pipe(protractor({
    configFile: "./test/protractor.conf.js",
    args: ['--baseUrl', 'http://192.168.1.151:8080']
  }));
  //.on('error', function(e) { throw e })
});
