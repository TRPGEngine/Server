const gulp = require('gulp');
const gls = require('gulp-live-server');

gulp.task('default', ['server']);

gulp.task('server', function() {
  var server = gls(
    ['test/run.js'],
    {env: {NODE_ENV: 'development'}},
    false
  );
  server.start();

  gulp.watch(['index.js', 'lib/**/*.js'], function() {
    console.log('gulp check code has been changed, restart server......');
    server.start.bind(server)().then(function(){
      console.log("server restarted!!!");
    }).catch(function(err){
      console.error("server restarted failed:" + err);
    });
  });
});
