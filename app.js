var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jf = require('jsonfile');
var readline = require('readline-sync');
var http = require('http');
var https = require('https');
var fs = require('fs');
var forceSSL = require('express-force-ssl');
var errorHandler = require('errorhandler');

// Try to load the config.
var config = require('./config');
if(!config) {
  throw "Error loading config file";
} else {
  console.log('cfg:', config);
}

if(config.send_text_messages && (!config.twilio_sid || !config.twilio_auth || !config.twilio_number)) {
  throw "twilio_sid, twilio_auth, and twilio_number are required when send_text_messages is turned on";
}

var app = express();

var ssl_options = {
  key:  fs.readFileSync('./ssl/private.key'),
  cert: fs.readFileSync('./ssl/ssl.crt'),
  ca:   [fs.readFileSync('./ssl/sub.class1.server.ca.pem'), fs.readFileSync('./ssl/ca.pem')]
};

var httpServer = http.createServer(app).listen(3000);
var secureServer = https.createServer(ssl_options, app).listen(3443);

io = require('socket.io')(secureServer);


var routes = require('./routes/index');
var status = require('./routes/status');


// view engine setup
app.engine('html', require('./html_engine'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

//sessions
app.use(session({secret: 'RM2jcxayCYLMxUHv5uiCwMHG+hvtBL6bsyZfTogYlwM='}));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(forceSSL);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower', express.static(path.join(__dirname, 'bower_components')));

app.use('/', routes);
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
    app.use(errorHandler({showStack: true, dumpExceptions: true}));
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

if (app.get('env') === 'development') {
  app.locals.pretty = true;
}


module.exports = app;
