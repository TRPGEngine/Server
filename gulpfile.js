const gulp = require('gulp');
const gls = require('gulp-live-server');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('default', ['server']);

gulp.task('server', function() {
  var server = gls(
    ['bin/www'],
    {env: {NODE_ENV: 'development'}}
  );
  server.start();

  gulp.watch(['public/scss/**/*.scss'], function (file) {
    gulp.start('scss');
    server.notify.apply(server, [file]);
  });
  gulp.watch(['public/**/*.css', 'public/**/*.html', 'public/**/*.js'], function (file) {
    server.notify.apply(server, [file]);
  });
  gulp.watch(['app.js', 'routes/**/*.js', 'components/**/*.js' , 'views/**/*.marko'], function() {
    console.log('gulp check code has been changed, restart server......');
    server.start.bind(server)().then(function(){
      console.log("server restarted!!!");
    }).catch(function(err){
      console.error("server restarted failed:" + err);
    });
  });
});

gulp.task('scss', function() {
  return gulp.src('./public/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./public/css'));
});
