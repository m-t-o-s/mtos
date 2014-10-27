'use strict';

var gulp = require('gulp');
var watch = require('gulp-watch');

module.exports = gulp.task('watch', function () {
  watch({ glob: [config.paths.src.scripts]}, ['lint']);
  watch({ glob: [config.paths.src.index]}, ['index']);
  watch({ glob: [config.paths.src.templates, config.paths.src.templatesHTML]}, ['templates']);
  watch({ glob: [config.paths.src.stylesGlob]}, ['styles']);
  watch({
    emitOnGlob: false,
    glob: [
      config.paths.dest.build.server+'/**/*.js',
      config.paths.dest.build.server+'/**/*.css',
      config.paths.dest.build.server+'/**/*.html'
    ]}, ['manifest']
  );
  watch({
    emitOnGlob: false,
    glob: [
      './gulp/**/*'
    ]}, ['exit']
  );
  watch({
    emitOnGlob: false,
    glob: [
      './build/**/*',
      './test/protractor/**/*',
      './server/**/*'
    ]}, ['protractor']
  );
  watch({
    emitOnGlob: false,
    glob: [
      './build/**/*',
      './test/karma/**/*',
      './server/**/*'
    ]}, ['karma']
  );
});
