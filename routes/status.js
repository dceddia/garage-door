var express = require('express');
var router = express.Router();
var door = require('door-ctrl')();
var config = require('../config');
var twilio = require('twilio');
var phoneValidator = require('../lib/phone_validator');

var timers = {};

var SECONDS = 1000;
var MINUTES = 60*SECONDS;

var timeBeforeAlert = {
  open:    5 * MINUTES,
  closing: 5 * MINUTES,
  opening: 5 * MINUTES,
  stopped: 5 * MINUTES,
  unknown: 5 * MINUTES
};

phoneValidator.loadPhones(config.phones);

router.get('/', function(req, res) {
  res.status(200).end(door.state());
});

router.post('/change', function(req, res) {
  if(twilio.validateExpressRequest(req, config.twilio_auth)) {
    console.log('Request is from Twilio.');
    console.log('  From number:', req.body.From);
    console.log('  Message:', req.body.Body);

    if(phoneValidator.validate(req.body.From)) {
      console.log('Phone number is authorized.');
    } else {
      console.log('Warning! Phone number is NOT authorized!');
    }
  } else {
    console.log('Request NOT from Twilio.');
  }
  res.status(200).end();
});

// TODO: Maybe these could be conditional based on a setting
// like 'repeatAlerts' or something. For now, use intervals.
function startTimer(callback, duration) {
  return setInterval(callback, duration);
}
function stopTimer(timerName) {
  clearInterval(timers[timerName]);
  timers[timerName] = null;
}

function sendAlert(msg) {
  if(config.send_text_messages) {
    var client = new twilio.RestClient(config.twilio_sid, config.twilio_auth);

    // Send an alert to every phone number we know about
    if(Object.prototype.toString.call(config.contacts) === '[object Array]') {
      config.contacts.forEach(function(contact) {
        client.sms.messages.create({
          to:   contact.number,
          from: config.twilio_number,
          body: msg
        },
        function(err, msg) {
          if(!err) {
            console.log('Sent text message w/ sid:', msg.sid);
          } else {
            console.log('Error sending text message:', err);
          }
        });
      });
    }
  }
}

// Tell the client when the door changes state
io.on('connection', function(socket) {
  door.on('change', function(oldValue, newValue) {
    socket.emit('change', newValue);
  });
});

// Keep track of state changes for ourselves too
door.on('change', function(oldValue, newValue) {
  // Changing to a valid state ('closed') cancels all timers
  if(newValue === 'closed') {
    Object.keys(timers).forEach(function(timerName) {
      stopTimer(timerName);
    });
    return;
  }

  // If we enter any state besides 'closed', start a timer
  // They have predefined limits on how long they're allowed to last before alerts go out
  timers[newValue] = startTimer(function() {
    console.log('door in', newValue, 'state too long!');
    sendAlert('Garage door has been ' + newValue + ' for more than 5 minutes.');
  }, timeBeforeAlert[newValue]);

  // End the timer for the previous state
  stopTimer(oldValue);

  console.log('note to self: state changed:', oldValue, '->', newValue);
});


module.exports = router;
