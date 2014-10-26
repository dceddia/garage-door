var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.post('/login', function(req, res) {
	if(req.param('password') == 'secret') {
		req.session.isLoggedIn = true;
		res.status(200).end();
	} else {
		res.status(403).send({error: 'Authentication failed.'});
	}
});

/* POST get login status: 200 if logged in, 403 otherwise */
router.post('/check-login', function(req, res) {
	if(req.session.isLoggedIn) {
		res.status(200).end();
	} else {
		res.status(403).end();
	}
});

module.exports = router;
