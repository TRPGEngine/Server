require('marko/node-require');

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
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
app.use(require('marko/express')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

if (app.get('env') === 'development') {
  app.use(require('connect-livereload')({port: 35729}));
}

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

// 开启socket.io
let trpg = require('./components/trpg');
trpg.run();

app.use(function(req, res, next) {
  if(trpg) {
    req.trpg = trpg;
    req.storage = trpg.storage;
  }
  next();
})

app.use('/', require('./routes/index'));

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
