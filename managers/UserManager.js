var jwt = require('jsonwebtoken');
var ModelUser = require('../models/ModelUser');
var ModelError = require('../models/ModelError');

var UserManager = function(secret) {
    this.tokenSecret = secret;

    this.validateContentExists = function(content) {
        return (content.length > 0 && content[0].value.length > 0);
    }
};

UserManager.prototype.createUser = function(facebookProfile, callback) {
    var user = new ModelUser({
        name: facebookProfile.displayName,
        id: facebookProfile.id
    });

    if (this.validateContentExists(facebookProfile.emails)) {
        user.email = facebookProfile.emails[0].value;
        if (this.validateContentExists(facebookProfile.photos)) {
            user.picture = facebookProfile.photos[0].value;
        }
        user.save(function(err){
            if (err) {
                callback(err, null);
            } else {
                callback(null, user);
            }
        });
    } else {
        callback(ModelError.MissingEmail);
    }
};

UserManager.prototype.findUserById = function(id, callback) {
    ModelUser.findById(id, callback);
};

UserManager.prototype.findUserByToken = function(token, callback) {
    try {
        var id = jwt.verify(token, this.tokenSecret);
        ModelUser.findById(id, callback);
    } catch (err) {
        callback(ModelError.IncorrectToken, null);
    }
};

UserManager.prototype.createToken = function(user) {
    return jwt.sign(user.id, this.tokenSecret);
};

module.exports = UserManager;
