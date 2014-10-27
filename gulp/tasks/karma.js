'use strict';

var gulp = require('gulp');
var karma = require('karma').server;
var path = require('path');

module.exports = gulp.task('karma', function (next) {
  karma.start({
    configFile: path.normalize(__dirname + '../../../test/karma.conf.js'),
    singleRun: true
  }, next);
});
