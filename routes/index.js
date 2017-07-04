const express = require('express');
const router = express.Router();
const md5 = require('../components/md5')
const auth = require('../components/middleware').auth;

router.get('/', function(req, res, next) {
  let template = require('../views/index.marko');
  let playerCount = 0;
  if(req.playerList) {
    playerCount = req.playerList.length;
  }
  res.marko(template, {playerCount});
});

router.post('/_login', function(req, res, next) {
  try {
    let username = req.body.username;
    let password = req.body.password;
    password = md5(password);

    req.db.connect(function(db) {
      db.models.core_user.one({username, password}, function(err, user) {
        if(err) {
          res.send({err});
          next();
        }

        let result = false;
        if(user){
          result = true;
          req.session.user = user;
          user.last_login = new Date();
          user.save();
        }

        res.send({result});
      })
    });
  }catch(err) {
    console.error(err);
  }
});

router.get('/lobby', auth, function(req, res, next) {
  let template = require('../views/lobby.marko');
  res.marko(template, {});
});

router.get('/room/:roomId', auth, function(req, res, next) {
  let template = require('../views/room.marko');
  let roomId = req.query.roomId;

  res.marko(template, {roomId});
});

module.exports = router;
