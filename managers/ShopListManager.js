/**
 * Created by Marcin on 06.05.2016.
 */
var ModelShopList = require('../models/ModelShopList');
var ModelShopItem = require('../models/ModelShopItem');
var ModelUser = require('../models/ModelUser');
var ModelError = require('../models/ModelError');
var async = require('async');

var USER_LIST_COUNT_LIMIT = 15;
var USER_LIST_SIZE_LIMIT = 100;

var ShopListManager = function () {

};

var userExceededListLimit = function (user, callback) {
    ModelShopList.count({'owner._id': user.id, deleted: {$exists: false}}, function (err, count) {
        callback(err || count >= USER_LIST_COUNT_LIMIT);
    });
};

var listExceededSizeLimit = function (listId, callback) {
    ModelShopItem.count({listId: listId, deleted: null}, function (err, count) {
        callback(err || count >= USER_LIST_SIZE_LIMIT);
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

var getShopItem = function (userId, listId, itemId, callback) {
    async.parallel([
        function (callback) {
            ModelShopList.findOne({_id: listId, 'users._id': userId, deleted: null}, callback);
        },
        function (callback) {
            ModelShopItem.findOne({_id: itemId, 'listId': listId, deleted: null}, callback);
        }
    ], function (err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results[0], results[1]);
        }
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
    ModelShopList.find({'users._id': user.id, deleted: null}).sort('-created').exec(function (err, list) {
        if (err) {
            callback(ModelError.Unknown);
        } else {
            callback(null, list);
        }
    });
};

ShopListManager.prototype.getShopList = function (user, shopId, callback) {
    ModelShopList.findOne({'_id': shopId, 'users._id': user.id, deleted: null}).sort('-created').exec(function (err, lists) {
        if (err) {
            callback(ModelError.Unknown);
        } else {
            callback(null, lists);
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
            } else if (list.isInvited(user.id)) {
                list.removeUser(user.id);
                list.save(function (err) {
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
        } else if (shopList.owner.id != user.id) {
            callback(ModelError.NotPermitted);
        } else if (!shopList.isInvited(userId)) {
            callback(ModelError.UserIsNotInvited);
        } else if (user.id != userId && shopList.owner.id == user.id) {
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

ShopListManager.prototype.getShopListItems = function (user, id, callback) {
    ModelShopList.findOne({_id: id, 'users._id': user.id, deleted: null}, function (err, list) {
        if (list) {
            ModelShopItem.find({listId: id, deleted: null}, function (err, items) {
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

ShopListManager.prototype.createShopItem = function (user, listItem, callback) {
    ModelShopList.findOne({_id: listItem.listId, deleted: null}, function (err, shopList) {
        if (err) {
            callback(ModelError.Unknown);
        } else if (!shopList || !shopList.isInvited(user.id)) {
            callback(ModelError.NotPermitted);
        } else {
            listExceededSizeLimit(listItem.listId, function (exceeded) {
                if (exceeded) {
                    return callback(ModelError.ListSizeLimitExceeded);
                }

                listItem.save(function (err) {
                    if (err)
                        return callback(ModelError.Unknown);

                    callback(null, listItem);
                });
            });
        }
    });
};

ShopListManager.prototype.updateShopItem = function (user, listId, listItemId, args, callback) {
    getShopItem(user.id, listId, listItemId, function (err, shopList, shopItem) {
        if (err) {
            return callback(ModelError.Unknown);
        } else if (!shopList) {
            return callback(ModelError.ListNotExist);
        } else if (!shopItem) {
            return callback(ModelError.ShopItemNotExists);
        }

        var changed = false;
        if (args.name) {
            shopItem.name = args.name;
            changed = true;
        }
        if (args.count) {
            shopItem.count = args.count;
            changed = true;
        }
        if (args.metric) {
            shopItem.metric = args.metric;
            changed = true;
        }
        if (args.bought) {
            shopItem.bought = args.bought;
            if (shopItem.bought > shopItem.count) {
                shopItem.bought = shopItem.count;
            }
            changed = true;
        }

        if (changed) {
            shopItem.save(function (err) {
                if (err) return callback(ModelError.Unknown);

                callback(null, shopItem);
            });
        } else {
            callback(ModelError.ShopItemNotChanged);
        }
    });
};

ShopListManager.prototype.removeShopItem = function (user, listId, listItemId, callback) {
    getShopItem(user.id, listId, listItemId, function (err, shopList, shopItem) {
        if (err) {
            return callback(ModelError.Unknown);
        } else if (!shopList) {
            return callback(ModelError.ListNotExist);
        } else if (!shopItem) {
            return callback(ModelError.ShopItemNotExists);
        }

        shopItem.deleted = Date.now();
        shopItem.save(function (err) {
            if (err) return callback(ModelError.Unknown);

            callback(null);
        });
    });
};

module.exports = ShopListManager;