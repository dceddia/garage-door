var express = require('express');
var router = express.Router();
var door = require('door-ctrl');

door.init();

router.get('/', function(req, res) {
  door.state().then(function(state) {
    res.send(state);
  });
});

router.post('/change', function(req, res) {
  door.push();
  res.status(200).end();
});


// Tell the client when the door changes state
io.on('connection', function(socket) {
  door.on_change(function(val) {
    socket.emit('change', val);
  });
});


module.exports = router;
