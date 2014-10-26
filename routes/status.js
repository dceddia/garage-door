var express = require('express');
var router = express.Router();
var door = require('door-ctrl')();

var timers = {};
var maximumOpenTime = 3000;

var timeBeforeAlert = {
  open: 3000,
  closing: 6000,
  opening: 6000,
  stopped: 3000,
  unknown: 2000
};

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

// TODO: Maybe these could be conditional based on a setting
// like 'repeatAlerts' or something. For now, use intervals.
function startTimer(callback, duration) {
  return setInterval(callback, duration);
}
function stopTimer(handle) {
  clearInterval(handle);
}

// Tell the client when the door changes state
io.on('connection', function(socket) {
  door.on('change', function(oldValue, newValue) {
    console.log('Told client', socket.id, 'that state changed:', oldValue, '->', newValue);
    socket.emit('change', newValue);
  });
});

// Keep track of state changes for ourselves too
door.on('change', function(oldValue, newValue) {
  // Changing to a valid state ('closed') cancels old timers
  if(newValue === 'closed') {
    Object.keys(timers).forEach(function(timerName) {
      stopTimer(timers[timerName]);
    });
    return;
  }

  // If we enter any state besides 'closed', start a timer
  // They have predefined limits on how long they're allowed to last before alerts go out
  timer[newValue] = (function() {
      console.log('door in', newValue, 'state too long!');
    }, timeBeforeAlert[newValue]);
  }

  console.log('note to self: state changed:', oldValue, '->', newValue);
});


module.exports = router;
