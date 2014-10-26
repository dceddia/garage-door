var express = require('express');
var router = express.Router();
var door = require('door-ctrl');

door.init();

router.get('/', function(req, res) {
  res.status(200).end(door.state());
});

router.post('/change', function(req, res) {
  if(req.session.isLoggedIn) {
    door.activate();
    res.status(200).end();
  } else {
    res.status(403).end();
  }
});


// Tell the client when the door changes state
io.on('connection', function(socket) {
  door.on_change(function(oldValue, newValue) {
    console.log('state changed:', oldValue, '->', newValue);
    socket.emit('change', newValue);
  });
});


module.exports = router;
