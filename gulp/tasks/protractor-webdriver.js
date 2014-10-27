'use strict';

var gulp = require('gulp');
var gp = require("gulp-protractor");

module.exports = gulp.task('protractor-webdriver', function(){
  gp.webdriver_update(gp.webdriver_standalone())
});
