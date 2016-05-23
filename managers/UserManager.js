var jwt = require('jsonwebtoken');
var async = require('async');
var ModelUser = require('../models/ModelUser');
var ModelError = require('../models/ModelError');

var UserManager = function (secret) {
    this.tokenSecret = secret;
};

var validateContentExists = function (content) {
    return (content.length > 0 && content[0].value.length > 0);
};

var updateUsers = function (users, callback) {
    async.mapLimit(users, 2, function (user, next) {
        user.save(next);
    }, callback);
};

UserManager.prototype.createUser = function (facebookProfile, callback) {
    var user = new ModelUser({
        name: facebookProfile.displayName,
        id: facebookProfile.id
    });

    if (validateContentExists(facebookProfile.emails)) {
        user.email = facebookProfile.emails[0].value;
        if (validateContentExists(facebookProfile.photos)) {
            user.picture = facebookProfile.photos[0].value;
        }
        user.save(function (err) {
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

UserManager.prototype.findUserById = function (id, callback) {
    ModelUser.findById(id, callback);
};

UserManager.prototype.findUserByToken = function (token, callback) {
    try {
        var id = jwt.verify(token, this.tokenSecret);
        ModelUser.findById(id, callback);
    } catch (err) {
        callback(ModelError.IncorrectToken, null);
    }
};

UserManager.prototype.findUserByEmail = function (email, callback) {
    ModelUser.find({email: email}, function (error, users) {
        if (users && users.length > 0) {
            callback(null, users[0]);
        } else if (users && users.length == 0) {
            callback(ModelError.NoUser);
        } else {
            callback(ModelError.Unknown);
        }
    });
};

UserManager.prototype.createToken = function (user) {
    return jwt.sign(user.id, this.tokenSecret);
};

UserManager.prototype.inviteFriend = function (user, email, callback) {
    var basicUser = user;
    this.findUserByEmail(email, function (error, user) {
        if (user && !basicUser.isOnFriendList(user.id)) {
            basicUser.inviteFriend(user, ModelUser.FriendStatus.WAITING_ACCEPTANCE);
            user.inviteFriend(basicUser, ModelUser.FriendStatus.INVITED);
            updateUsers([basicUser, user], function (error) {
                if (error) {
                    console.log(error);
                    callback(ModelError.Unknown);
                } else {
                    callback(null, basicUser.friends);
                }
            });
        } else if (user) {
            callback(ModelError.AlreadyFriend);
        } else {
            callback(ModelError.NoUser);
        }
    });
};

UserManager.prototype.removeFriend = function (user, id, callback) {
    var basicUser = user;
    if (user.isOnFriendList(id)) {
        this.findUserById(id, function(err, user) {
            if (user) {
                basicUser.removeFriend(user.id);
                user.removeFriend(basicUser.id);
                updateUsers([basicUser, user], function (error) {
                    if (error) {
                        console.log(error);
                        callback(ModelError.Unknown);
                    } else {
                        callback(null, basicUser.friends);
                    }
                });
            } else {
                callback(ModelError.NoUser);
            }
        });
    } else {
        callback(null, basicUser.friends);
    }
};

UserManager.prototype.acceptFriendInvitation = function (user, id, callback) {
    var basicUser = user;
    if (basicUser.isInvited(id)) {
        this.findUserById(id, function (error, user) {
            if (user) {
                basicUser.acceptFriendInvitation(id);
                user.acceptFriendInvitation(basicUser.id);
                updateUsers([basicUser, user], function (err) {
                    if (err) {
                        console.log(err);
                        callback(ModelError.Unknown);
                    } else {
                        callback(null, basicUser.friends);
                    }
                });
            } else {
                callback(ModelError.NoUser);
            }
        });
    } else {
        callback(ModelError.NotInvited);
    }
};

module.exports = UserManager;
