var express = require('express');
var router = express.Router();
var door = require('door-ctrl')();

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
  door.on('change', function(oldValue, newValue) {
    console.log('Told client', socket.id, 'that state changed:', oldValue, '->', newValue);
    socket.emit('change', newValue);
  });
});

// Keep track of state changes for ourselves too
door.on('change', function(oldValue, newValue) {
  console.log('note to self: state changed:', oldValue, '->', newValue);
});


module.exports = router;
