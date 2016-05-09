/**
 * Created by Marcin on 06.05.2016.
 */
var ModelShopList = require('../models/ModelShopList');
var ModelError = require('../models/ModelError');

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

module.exports = ShopListManager;