/**
 * Created by Marcin on 06.05.2016.
 */
var ModelShopList = require('../models/ModelShopList');
var ModelShopItem = require('../models/ModelShopItem');
var ModelUser = require('../models/ModelUser');
var ModelError = require('../models/ModelError');
var async = require('async');

var MAX_USER_LIST_COUNT = 5;

var ShopListManager = function () {

};

var userExceededListLimit = function (user, callback) {
    ModelShopList.count({'owner._id': user.id, deleted: {$exists: false}}, function (err, count) {
        if (err || count >= MAX_USER_LIST_COUNT) {
            callback(true);
        } else {
            callback(false);
        }
    });
};

var deleteList = function (list, callback) {
    async.parallel([
        function (callback) {
            list.deleted = Date.now();
            list.save(callback);
        },
        function (callback) {
            ModelShopItem.find({list_id: list.id}).remove(callback);
        }
    ], function (err, results) {
        callback(err);
    });
};

ShopListManager.prototype.createShopList = function (user, listName, callback) {
    userExceededListLimit(user, function (exceeded) {
        if (exceeded) {
            callback(ModelError.ListCountLimitExceeded);
        } else {
            var shopList = new ModelShopList({
                name: listName,
                owner: user,
                users: [user]
            });
            shopList.save(function (err) {
                if (err) {
                    callback(ModelError.Unknown);
                } else {
                    callback(null, shopList);
                }
            });
        }
    });
};

ShopListManager.prototype.getShopLists = function (user, callback) {
    ModelShopList.find({'users._id': user.id, deleted: null}, function (err, lists) {
        if (err) {
            callback(ModelError.Unknown);
        } else {
            callback(null, lists);
        }
    });
};

ShopListManager.prototype.getShopListItems = function (user, id, callback) {
    ModelShopList.findOne({_id: id, 'users._id': user.id, deleted: null}, function (err, list) {
        if (list) {
            ModelShopItem.find({list_id: id}, function (err, items) {
                if (err) {
                    callback(ModelError.Unknown);
                } else {
                    callback(null, items);
                }
            });
        } else if (err) {
            callback(ModelError.Unknown);
        } else {
            callback(ModelError.ListNotExist);
        }
    });
};

ShopListManager.prototype.deleteShopList = function (user, id, callback) {
    ModelShopList.findOne({_id: id, deleted: null}, function (err, list) {
        if (list) {
            if (list.owner.id == user.id) {
                deleteList(list, function (err) {
                    if (err) {
                        callback(ModelError.Unknown);
                    } else {
                        callback();
                    }
                });
            } else {
                callback(ModelError.NotPermitted);
            }
        } else {
            callback(ModelError.ListNotExist);
        }
    });
};

ShopListManager.prototype.addUserToShopList = function (user, userId, listId, callback) {
    async.parallel(
        [
            function (innerCallback) {
                ModelShopList.findOne({_id: listId, deleted: null}, innerCallback);
            },
            function (innerCallback) {
                ModelUser.findById(userId, innerCallback);
            }
        ],
        function (err, results) {
            if (err) {
                return callback(ModelError.Unknown);
            }
            var shopList = results[0];
            var userToAdd = results[1];
            if (!shopList) {
                return callback(ModelError.ListNotExist);
            }
            if (!userToAdd) {
                return callback(ModelError.NoUser);
            }

            if (shopList.owner.id != user.id) {
                callback(ModelError.NotPermitted);
            } else if (shopList.isInvited(userToAdd.id)) {
                callback(ModelError.AlreadyInvited);
            } else if (!user.isFriend(userToAdd.id)) {
                callback(ModelError.NotOnFriendList);
            } else {
                userExceededListLimit(userToAdd, function (exceededLimit) {
                    if (exceededLimit) {
                        callback(ModelError.ListCountLimitExceeded);
                    } else {
                        shopList.users.push(userToAdd);
                        shopList.save(function (err) {
                            if (err) {
                                callback(ModelError.Unknown);
                            } else {
                                callback();
                            }
                        })
                    }
                });
            }
        }
    );
};

ShopListManager.prototype.deleteUserFromShopList = function (user, userId, listId, callback) {
    ModelShopList.findOne({_id: listId, deleted: null}, function (err, shopList) {
        if (!shopList) {
            callback(ModelError.ListNotExist);
        } else if (!shopList.isInvited(user.id)) {
            callback(ModelError.NotPermitted);
        } else if (shopList.owner.id === userId) {
            callback(ModelError.CannotRemoveOwner);
        } else if (!shopList.isInvited(userId)) {
            callback(ModelError.UserIsNotInvited);
        } else if (shopList.owner.id == user.id || user.id == userId) {
            shopList.removeUser(userId);
            shopList.save(function (err) {
                if (err) {
                    callback(ModelError.Unknown);
                } else {
                    callback();
                }
            });
        } else {
            callback(ModelError.NotPermitted);
        }
    });
};

module.exports = ShopListManager;