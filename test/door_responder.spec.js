var expect = require('expect.js');
var responderLib = require('../lib/door_responder');
var responder;
var mockDoor;
var mockPhoneValidator;

beforeEach(function() {
	mockDoor = {
		state: function() {},
		activate: function() {}
	}
	mockPhoneValidator = {
		authorize: function() {}
	}
	responder = responderLib(mockDoor, mockPhoneValidator);
});

function expectInvalidCommand(command, doorState) {
	expectResponse(command, doorState, 'Invalid command. Door is currently ' + doorState + '.')
}

function expectResponse(command, doorState, expectedMsg) {
	mockDoor.state = function() { return doorState; }
	var responded = false;
	responder.respondTo(command, function(msg) {
		responded = true;
		expect(msg).to.eql(expectedMsg);
	});
	expect(responded).to.be(true);
}

function expectActivationWithoutResponse(command, doorState) {
	var activatedDoor = false;
	var responded = false;

	mockDoor.state = function() { return doorState; }
	mockDoor.activate = function() { activatedDoor = true; };
	
	responder.respondTo(command, function(msg) {
		// Shouldn't get here
		responded = true;
	});

	expect(responded).to.be(false);
	expect(activatedDoor).to.be(true);
}

describe("command: open", function() {
	it("responds with a message when the door is open", function() {
		expectInvalidCommand(['open'], 'open');
	});

	it("responds with a message when the door is opening", function() {
		expectInvalidCommand(['open'], 'opening');
	});

	it("responds with a message when the door is stopped", function() {
		expectInvalidCommand(['open'], 'stopped');
	});

	it("responds with a message when the door is unknown", function() {
		expectInvalidCommand(['open'], 'unknown');
	});

	it("opens the door if the door is closed", function() {
		expectActivationWithoutResponse(['open'], 'closed');
	});

	it("opens the door if the door is closing", function() {
		expectActivationWithoutResponse(['open'], 'closing');
	});
});

describe("command: close", function() {
	it("responds with a message when the door is closed", function() {
		expectInvalidCommand(['close'], 'closed');
	});

	it("responds with a message when the door is closing", function() {
		expectInvalidCommand(['close'], 'closing');
	});

	it("closes the door if the door is open", function() {
		expectActivationWithoutResponse(['close'], 'open');
	});

	it("closes the door if the door is stopped", function() {
		expectActivationWithoutResponse(['close'], 'stopped');
	});
});

describe("command: stop OR cancel", function() {
	it("responds with a message when the door is closed", function() {
		expectInvalidCommand(['stop'], 'closed');
		expectInvalidCommand(['cancel'], 'closed');
	});

	it("stops the door if the door is opening", function() {
		expectActivationWithoutResponse(['stop'], 'opening');
		expectActivationWithoutResponse(['cancel'], 'opening');
	});

	it("reverses the door if the door is closing", function() {
		expectActivationWithoutResponse(['stop'], 'closing');
		expectActivationWithoutResponse(['cancel'], 'closing');
	});
});

describe("command: status", function() {
	it("returns the current door status", function() {
		expectResponse(['status'], 'open', 'Door is OPEN');
		expectResponse(['status'], 'foobar', 'Door is FOOBAR');
	});
});

describe("command: ?", function() {
	it("returns help text", function() {
		expectResponse(['?'], '', 'Available commands: open, close, status, stop, cancel, help, authorize');
	});
});

describe("command: authorize", function() {
	it("returns a confirmation message if authorization succeeds", function() {
		expectResponse(['authorize', '+12223334444'], '', 'Phone number +12223334444 is now authorized.');
	});

	it("authorizes the number if it's in a valid format", function() {
		var authorized = false;
		mockPhoneValidator.authorize = function() { authorized = true; };
		expectResponse(['authorize', '+12223334444'], '', 'Phone number +12223334444 is now authorized.');
		expect(authorized).to.be(true);
	});

	it("returns an error message if authorization fails", function() {
		expectResponse(['authorize', '12223334444'], '', 'Invalid command. Expected phone number in the format +1xxxxxxxxxx');
	});

	it("does not authorize invalid numbers", function() {
		var authorized = false;
		mockPhoneValidator.authorize = function() { authorized = true; };
		expectResponse(['authorize', '12223334444'], '', 'Invalid command. Expected phone number in the format +1xxxxxxxxxx');
		expect(authorized).to.be(false);
	});
});

describe("isPhoneNumber", function() {
	it("returns true for +12223334444", function() {
		expect(responder.isPhoneNumber('+12223334444')).to.be(true);
	});
	it("returns false for 12223334444", function() {
		expect(responder.isPhoneNumber('12223334444')).to.be(false);
	});
	it("returns false for 111-222-3333", function() {
		expect(responder.isPhoneNumber('111-222-3333')).to.be(false);
	});
	it("returns false for (111) 222-3333", function() {
		expect(responder.isPhoneNumber('(111) 222-3333')).to.be(false);
	});
});

describe("sanitize", function() {
	it("returns an array of arguments", function() {
		expect(responder.sanitize("activate +1234")).to.eql(['activate', '+1234']);
	});

	it("returns everything in lower case", function() {
		expect(responder.sanitize('Open')).to.eql(['open']);
	});

	it("removes multiple spaces", function() {
		expect(responder.sanitize("activate    +1234")).to.eql(['activate', '+1234']);
	});
});
