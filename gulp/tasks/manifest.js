'use strict';

var gulp = require('gulp');
var gulpif = require('gulp-if');
var manifest = require('gulp-manifest');

gulp.task('manifest', function(){
  return gulp.src(['build/**/*'])
  .pipe(manifest({
    hash: true,
    timestamp: false,
    preferOnline: true,
    network: ['http://*', 'https://*', '*'],
    filename: 'app.manifest',
    exclude: 'app.manifest'
  }))
  .pipe(gulpif(release, gulp.dest(config.paths.dest.release.index), gulp.dest(config.paths.dest.build.index)));
})
