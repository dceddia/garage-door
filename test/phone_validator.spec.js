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