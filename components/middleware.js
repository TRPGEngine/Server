module.exports = {
  auth: function(req, res, next) {
    var session = req.session;
    if (!session.user) {
      res.redirect('/');
      return;
    }
    req.user = session.user;
    next();
  },
  authAjax: function(req, res, next) {
    var session = req.session;
    if (!session.user) {
      res.send({result: false});
      return;
    }
    req.user = session.user;
    next();
  }
}
