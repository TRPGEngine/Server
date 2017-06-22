require('marko/node-require');

const express = require('express');
const uuid = require('uuid');
const session = require('express-session');
const sessConfig = require('config').get('session');
const path = require('path');

const app = express();

if (app.get('env') !== 'production') {
  require('marko/compiler').defaultOptions.preserveWhitespace = true;
  require('marko/compiler').defaultOptions.writeToDisk = false;
}
app.use(express.static(path.join(__dirname, 'public')));

// use session
const FileStore = require('session-file-store')(session);
app.use(session({
  resave: false,
  saveUninitialized: true,
  genid: function() {
    return uuid.v1(); // use UUIDs for session IDs
  },
  rolling: true,
  cookie: {
    maxAge: sessConfig.maxAge
  },
  secret: 'trpg engine',
  store: new FileStore()
}));

// error handler
// const pageErrors = require('./views/errors.marko')
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development'
//     ? err
//     : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render(pageErrors, {errors: err});
// });

console.log('server started success');

module.exports = app;
