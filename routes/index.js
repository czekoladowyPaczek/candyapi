var passport = require('passport');
var express = require('express');
var router = express.Router();
var validator = require('../helpers/validator');
var ModelError = require('../models/ModelError');
var UserManager = require('../managers/UserManager');

/* GET home page. */
router.get('/', function(req, res, next) {
    var user = new ModelUser({"name":"name", "email":"email@email.com"});
    res.send(user);
});

router.post('/register', function(req, res){
    var email = req.body.email;
    var name = req.body.name;
    var password = req.body.password;

    if (validator.isEmpty(email) || validator.isEmpty(name) || validator.isEmpty(password)) {
        res.statusCode = 400;
        res.json(ModelError.MissingProperties);
        return;
    }

    UserManager.register(name, email, password, function(err, user, token) {
        if (err) {
            res.statusCode = 400;
            res.json(err);
        } else {
            res.statusCode = 200;
            res.json({user: user, token: token});
        }
    });
});

router.post('/login',
    passport.authenticate('local', {session: false}),
    function(req, res){
        var user = req.user;
        UserManager.createToken(user, function(err, user, token) {
            if (err) {
                res.statusCode = 400;
                res.json(ModelError.Unknown);
            } else {
                res.statusCode = 200;
                res.json({user: user, token: token});
            }
        });
});

module.exports = router;
