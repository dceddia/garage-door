var expect = require('expect.js');
var validator = require('../lib/phone_validator');
var bcrypt = require('bcrypt');

beforeEach(function() {
	var hash = bcrypt.hashSync('+19995551212', 10);

	validator.loadPhones([hash]);
});

it("should check a phone number against a hash", function() {
	expect(validator.validate('1234')).to.eql(false);
	expect(validator.validate('+19995551212')).to.eql(true);
});

it("should authorize new numbers and return a hash", function() {
	expect(validator.authorize('+12345670000').length).to.eql(60);
});

it("should validate numbers after they've been authorized", function() {
	validator.authorize('+12345670000');
	expect(validator.validate('+19995551212')).to.eql(true); // the original number
	expect(validator.validate('+12345670000')).to.eql(true); // the new number
});