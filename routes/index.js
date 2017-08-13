const express = require('express');
const router = express.Router();
const md5 = require('../components/md5')
const auth = require('../components/middleware').auth;
const authAjax = require('../components/middleware').authAjax;

router.get('/', function(req, res, next) {
  let template = require('../views/index.marko');
  let playerCount = 0;
  if(req.trpg && req.trpg.player) {
    playerCount = req.trpg.player.list.list.length;
    console.log(playerCount);
  }
  res.marko(template, {playerCount});
});

router.post('/_login', function(req, res, next) {
  try {
    let username = req.body.username;
    let password = req.body.password;
    password = md5(password);

    req.storage.connect(function(db) {
      db.models.player_user.one({username, password}, function(err, user) {
        if(err) {
          res.send({err});
          next();
        }

        let result = false;
        if(user){
          result = true;
          delete user.password;
          req.session.user = user;
          user.last_login = new Date();
          user.save();
        }

        res.send({result});
      })
    });
  }catch(err) {
    console.error(err);
    res.send({result: false});
  }
});

router.get('/lobby', auth, function(req, res, next) {
  let template = require('../views/lobby.marko');
  res.marko(template, {});
});

router.get('/room/:roomId', auth, function(req, res, next) {
  let template = require('../views/room.marko');
  let roomId = req.params.roomId;
  let playerInfo = req.user;

  res.marko(template, {roomId, playerInfo});
});

router.get('/player/_info', authAjax, function(req, res, next) {
  let user = req.user;
  res.send({
    result: true,
    user
  });
});

router.get('/player/actor/_list', authAjax, function(req, res, next) {
  try{
    let user = req.user;
    req.db.connect(function(db) {
      // console.log(db.models);

      res.send({
        result: true,
        user
      });
    });
  }catch(err) {
    console.error(err);
    res.send({result: false});
  }


});

module.exports = router;
