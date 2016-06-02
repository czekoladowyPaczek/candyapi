var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var filter = require('content-filter');

var UserManager = require('./managers/UserManager');
var ShopListManager = require('./managers/ShopListManager');

var app = module.exports = express();

var config = require("./config/config.js")(app.get('env'));
var managers = {
    user: new UserManager(config.secret),
    shop: new ShopListManager()
};
var pass = require('./pass.js')(passport, config.facebook, managers.user);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(filter());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

var users = require('./routes/users');
var friends = require('./routes/friends');
var shop = require('./routes/shop');
var shopInvitations = require('./routes/shopInvitation');

app.use('/user', users(express.Router(), managers.user));
app.use('/friend', friends(express.Router(), managers.user));
app.use('/shop', shop(express.Router(), managers.shop));
app.use('/invitation/shop', shopInvitations(express.Router(), managers.shop));

mongoose.connection.on('open', function () {
    console.log('Connected to mongo server.');
});
mongoose.connection.on('error', function (err) {
    console.log('Connection to mongo could not be established ' + err);
});
mongoose.connect(config.db.url);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    var error = {};
    if (err.code) {
        error.code = err.code;
    }
    error.message = err.message;
    res.send(error);
});

if (!module.parent) {
    app.listen(3000);
    console.log("Express server listening on port 3000");
}