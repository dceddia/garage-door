var express = require('express');
var router = express.Router();
var door = require('door-ctrl')();
var config = require('../config');
var twilio = require('twilio');
var phoneValidator = require('../lib/phone_validator');
var responder = require('../lib/door_responder')(door, phoneValidator);

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

      responder.respondTo(responder.sanitize(req.body.Body), function(message) {
        var resp = new twilio.TwimlResponse();
        resp.sms(message);
        res.status(200).type('application/xml');
        res.end(resp.toString());
      });
    } else {
      console.log('Warning! Phone number is NOT authorized!');
      res.status(200).end();
    }
  } else {
    console.log('Request NOT from Twilio.');
    res.status(403).end();
  }
});

// Tell the client when the door changes state
io.on('connection', function(socket) {
  door.on('change', function(oldValue, newValue) {
    socket.emit('change', newValue);
  });
});

// Keep track of state changes for ourselves too
door.on('change', alerting.valueChanged);


module.exports = router;
