var twilio = require('twilio');
var config = require('../config');

var timers = [];

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
  timers.push(setInterval(callback, duration));
}
function stopAllTimers() {
  while(timers.length > 0) {
    clearInterval(timers.shift());
  }
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
  // Cancel existing timers
  stopAllTimers();

  // No need to start a new timer if the door is now closed
  if(newValue === 'closed') {
    return;
  }

  // If we enter any state besides 'closed', start a timer
  // They have predefined limits on how long they're allowed to last before alerts go out
  startTimer(function() {
    console.log('door in', newValue, 'state too long!');
    exports.sendAlert('Garage door has been ' + newValue + ' for more than 5 minutes.');
  }, timeBeforeAlert[newValue]);
  
  console.log('note to self: state changed:', oldValue, '->', newValue);
}


exports.valueChanged = valueChanged;
