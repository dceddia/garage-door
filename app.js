var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jf = require('jsonfile');
var readline = require('readline-sync');

// Try to load the config.
var config;
try {
  config = jf.readFileSync(__dirname + '/config.json');
} 
catch(err) {
  // If there's no config, stop here
  if(err.code === 'ENOENT') {
    console.log("No configuration file found. Please create config.json. See README for the format.");
    process.exit();
  }

  // Other errors could be syntax or something. It's useful to see those.
  throw err;
}

// If the config is missing important info, don't continue
function requireField(field, json, where) {
  where = where || "'config.json'";
  if(!json[field]) {
    console.log("Field '" + field + "' is missing from " + where + ". It's required. Cannot continue.");
    process.exit();
  }
}
requireField('open_pin', config);
requireField('closed_pin', config);
requireField('relay_pin', config);
requireField('secrets_file', config);

// Try to read the secrets file
var secrets;
try {
  secrets = jf.readFileSync(config.secrets_file);
}
catch(err) {
  // If there's no secrets file, prompt for answers and create it
  if(err.code === 'ENOENT') {
    console.log("No secrets file found. Answer these questions and we'll create one.");
    console.log("(assuming write access to '" + config.secrets_file + "')");

    secrets = {};
    secrets.password = readline.question("Choose a password:", {noEchoBack: true});
    secrets.twilio_sid = readline.question("Enter Twilio Account SID: ");
    secrets.twilio_auth = readline.question("Enter Twilio Auth Token: ");

    jf.writeFileSync(config.secrets_file, secrets, {}, function(err) {
      console.log(err);
    });
  } else {
    // Other errors could be syntax or something. It's useful to see those.
    throw err;
  }
}

// Verify that secrets contains a password, and Twilio info if necessary
requireField('password', secrets, "'" + config.secrets_file + "'");
if(config.send_text_messages) {
  requireField('twilio_sid', secrets, "'" + config.secrets_file + "'");
  requireField('twilio_auth', secrets, "'" + config.secrets_file + "'");
}

var app = express();

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
io = require('socket.io')(server);


var routes = require('./routes/index');
var users = require('./routes/users');
var status = require('./routes/status');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//sessions
app.use(session({secret: 'RM2jcxayCYLMxUHv5uiCwMHG+hvtBL6bsyZfTogYlwM='}));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower', express.static(path.join(__dirname, 'bower_components')));

app.use('/', routes);
app.use('/users', users);
app.use('/status', status)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
