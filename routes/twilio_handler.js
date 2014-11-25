var express = require('express');
var router = express.Router();

router.post('/command', function(req, res) {
	console.log(req);
	res.status(200).end();
});

module.exports = router;