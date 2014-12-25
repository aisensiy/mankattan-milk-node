var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jsonp = require('jsonp-express');

// connect mongodb
require('./db/db_connect.js');
var config = require('./config/config');

var routes = require('./routes/index');
var users = require('./routes/users');
var wx = require('./routes/weixin');
var stat = require('./routes/stat');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(jsonp);

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

app.use(session({
  secret: config.get('COOKIE_SECRET'),
  store: new MongoStore({
    host: config.get('DB_HOST'),
    db: config.get('DB_NAME'),
    port: config.get('DB_PORT')
  }),
  cookie: { maxAge: config.get('COOKIE_MAX_AGE') },
  resave: false,
  saveUninitialized :false
}));

app.use('/', routes);
app.use('/users', users);
app.use('/wx', wx);
app.use('/stat', stat);

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
