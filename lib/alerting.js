var twilio = require('twilio');
var config = require('../config');

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
          to:   contact,
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
exports.sendAlert = sendAlert;

function valueChanged(oldValue, newValue) {
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
    exports.sendAlert('Garage door has been ' + newValue + ' for more than 5 minutes.');
  }, timeBeforeAlert[newValue]);

  // End the timer for the previous state
  stopTimer(oldValue);

  console.log('note to self: state changed:', oldValue, '->', newValue);
}


exports.valueChanged = valueChanged;