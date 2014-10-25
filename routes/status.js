var express = require('express');
var router = express.Router();
var door = require('door-ctrl');

door.init();

router.get('/', function(req, res) {
  door.state().then(function(state) {
    res.send(state);
  });
});

module.exports = router;