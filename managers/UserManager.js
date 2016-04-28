var jwt = require('jsonwebtoken');
var ModelUser = require('../models/ModelUser');

var UserManager = function(secret) {
    this.tokenSecret = secret;
};

UserManager.prototype.createUser = function(facebookProfile, callback) {
    var user = new ModelUser({
        name: facebookProfile.displayName
    });
    user.id = facebookProfile.id;
    if (facebookProfile.emails.length > 0) {
        user.email = facebookProfile.emails[0].value;
    }
    user.save(function(err){
        if (err) {
            callback(err, null);
        } else {
            callback(null, user);
        }
    });
};

UserManager.prototype.findUserById = function(id, callback) {
    ModelUser.findById(id, callback);
};

UserManager.prototype.findUserByToken = function(token, callback) {
    var id = jwt.verify(token, this.tokenSecret);
    ModelUser.findById(id, callback);
};

UserManager.prototype.createToken = function(user) {
    return jwt.sign(user.id, this.tokenSecret);
};

module.exports = UserManager;
