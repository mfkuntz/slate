const gulp = require('gulp');
const ts = require('gulp-typescript');


const tsProject = ts.createProject('tsconfig.json');
gulp.task('build', () => {
  const result = tsProject.src() // instead of gulp.src(...)
    .pipe(tsProject());

  return result.js.pipe(gulp.dest('autoDocs/dist'));
});

gulp.task('copy', () => {
  gulp.src('./autoDocs/src/**/*.json')
    .pipe(gulp.dest('autoDocs/dist'));
});

gulp.task('run', ['build', 'copy'], () => {
  /* eslint-disable no-console, global-require */
  const Runner = require('./autoDocs/dist/runner').default;

  const runner = new Runner();

  runner.run();

  /* eslint-enable no-console, global-require */
});
