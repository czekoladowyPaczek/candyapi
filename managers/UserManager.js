var jwt = require('jsonwebtoken');
var app = require('../app.js');
var validator = require('../helpers/validator');
var ModelError = require('../models/ModelError');
var ModelUser = require('../models/ModelUser');

var createNewToken = function(user, callback) {
    var token = jwt.sign({id: user.id, email: user.email}, app.get('superSecret'));
    callback(null, user, token);
};

var registerUser = function(name, email, password, callback) {
    if (!validator.isEmail(email)) {
        callback(ModelError.IncorrectEmail, null, null);
        return;
    }

    var user = new ModelUser({email: email, name: name});
    user.setPassword(password);
    user.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                    callback(ModelError.EmailAlreadyExists, null, null);
                    break;
                default:
                    callback(ModelError.Unknown, null, null);
                    break;
            }
        } else {
            createNewToken(user, callback);
        }
    });
};

module.exports.register = registerUser;
module.exports.createToken = createNewToken;
