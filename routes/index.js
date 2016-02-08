var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var validator = require('../helpers/validator');
var modelError = require('../models/ModelError');

var ModelUser = require('../models/ModelUser');
var ModelAccessToken = require('../models/ModelAccessToken');

/* GET home page. */
router.get('/', function(req, res, next) {
    var user = new ModelUser({"name":"name", "email":"email@email.com"});
    res.send(user);
    user.save(function(err){

    });
});

router.post('/register', function(req, res) {
    var email = req.body.email;
    var name = req.body.name;
    var password = req.body.password;

    if (validator.isEmpty(email) || validator.isEmpty(name) || validator.isEmpty(password)) {
        res.statusCode = 400;
        res.json(modelError.MissingProperties);
        return;
    }
    if (!validator.isEmail(email)) {
        res.statusCode = 400;
        res.json(modelError.IncorrectEmail);
        return;
    }

    var user = new ModelUser({email: email, name: name});
    user.setPassword(password);
    user.save(function(err) {
        if (err) {
            res.statusCode = 400;
            switch (err.code) {
                case 11000:
                    res.json(modelError.EmailAlreadyExists);
                    break;
                default:
                    res.json(modelError.Unknown);
                    break;
            }
        } else {
            var token = jwt.sign(user.email, req.app.get('superSecret'));

            var accessToken = new ModelAccessToken({
                userId: user.id,
                token: token
            });
            accessToken.save(function(err) {
                if (err) {
                    res.statusCode = 400;
                    res.json(modelError.Unknown);
                } else {
                    res.statusCode = 200;
                    res.json({user: user, token: token});
                }
            });
        }
    });

});

module.exports = router;
