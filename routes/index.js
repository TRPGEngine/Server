const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  let template = require('../views/login.marko');
  res.marko(template, {});
});

router.get('/lobby', function(req, res, next) {
  let template = require('../views/lobby.marko');
  res.marko(template, {});
});
router.get('/:roomId/lobby', function(req, res, next) {
  let template = require('../views/room.marko');
  let roomId = req.query.roomId;

  res.marko(template, {roomId});
});

module.exports = router;
