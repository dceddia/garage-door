var bcrypt = require('bcrypt');

var loadPhones = function (validPhoneList) {
	this.validPhoneList = validPhoneList;
}


var validate = function (phoneNumber) {
	var found = false;

	this.validPhoneList.forEach(function(phone) {
		if(bcrypt.compareSync(phoneNumber, phone)) {
			found = true;
		}
	});

	return found;
}

var authorize = function(phoneNumber) {
	var hash = bcrypt.hashSync(phoneNumber, 10);
	this.validPhoneList.push(hash);
	return hash;
}

module.exports.loadPhones = loadPhones;
module.exports.validate = validate;
module.exports.authorize = authorize;

if(require.main === module) {
	if(process.argv.length < 3) {
		throw('Requires one argument: the phone number to hash. Try \'node phone_validator.js +12223334444\'');
	}

	loadPhones([]);
	console.log(authorize(process.argv[2]));
}