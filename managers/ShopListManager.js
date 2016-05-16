/**
 * Created by Marcin on 06.05.2016.
 */
var ModelShopList = require('../models/ModelShopList');
var ModelShopItem = require('../models/ModelShopItem');
var ModelError = require('../models/ModelError');
var async = require('async');

var MAX_USER_LIST_COUNT = 5;

var ShopListManager = function () {

};

var userExceededListLimit = function (user, callback) {
    ModelShopList.count({'owner.id': user.id, deleted: {$exists: false}}, function (err, count) {
        if (err || count > MAX_USER_LIST_COUNT) {
            callback(true);
        } else {
            callback(false);
        }
    });
};

var deleteList = function (list, callback) {
    async.parallel([
        function(callback) {
            list.deleted = Date.now();
            list.save(callback);
        },
        function(callback) {
            ModelShopItem.find({list_id: list.id}).remove(callback);
        }
    ], function (err, results) {
        callback(err);
    });
};

ShopListManager.prototype.createShopList = function (user, listName, callback) {
    userExceededListLimit(user, function (exceeded){
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
                    callback(shopList);
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
            if (list.owner.id === user.id) {
                deleteList(list, function (err) {
                    if (err) {
                        callback(ModelError.Unknown);
                    } else {
                        callback(null);
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

module.exports = ShopListManager;