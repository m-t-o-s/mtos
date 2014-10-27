'use strict';

var gulp = require('gulp');
var gulpif = require('gulp-if');

module.exports = gulp.task('cordova', function () {
  return gulp.src(config.paths.src.cordova)
    .pipe(gulpif(release, gulp.dest(config.paths.dest.release.index), gulp.dest(config.paths.dest.build.index)));
});
