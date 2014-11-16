var _ = require('lodash');

function Responder() {
  this.commands = {};
}

Responder.prototype.on = function(cmd, callback) {
  this.commands[cmd] = callback;
}

Responder.prototype.respondTo = function(args, respondWith) {
  this.commands[args[0]] && this.commands[args[0]](respondWith, args);
}

var responder = new Responder();


module.exports = function(door, phoneValidator) {
	responder.on('open', function(respondWith, args) {
	  if(_.include(['closed', 'closing'], door.state())) {
	    door.activate();
	  } else {
	    respondWith('Invalid command. Door is currently ' + door.state() + '.');
	  }
	});

	responder.on('authorize', function(respondWith, args) {
		var phone = args[1]
	  if(phone && module.exports.isPhoneNumber(phone)) {
	    phoneValidator.authorize(phone);
	    respondWith('Phone number ' + phone + ' is now authorized.');
	  } else {
	    respondWith('Invalid command. Expected phone number in the format +1xxxxxxxxxx');
	  }
	});

	responder.on('close', function(respondWith) {
	  if(_.include(['open', 'stopped'], door.state())) {
	    door.activate();
	  } else {
	    respondWith('Invalid command. Door is currently ' + door.state() + '.');
	  }
	});

	responder.on('help', function(respondWith) {
	  respondWith('Available commands: open, close, status, help, authorize');
	});

	responder.on('status', function(respondWith) {
	  respondWith('Door is ' + door.state().toUpperCase());
	});

	return responder;
};

module.exports.isPhoneNumber = function(str) {
	return /\+\d{11}/.test(str);
};