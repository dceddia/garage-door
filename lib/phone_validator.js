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

module.exports.loadPhones = loadPhones;
module.exports.validate = validate;