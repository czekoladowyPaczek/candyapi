/**
 * Created by Marcin on 06.05.2016.
 */
var ModelShopList = require('../models/ModelShopList');

var ShopListManager = function() {

};

ShopListManager.prototype.createShopList = function() {
    var item = new ModelShopList({
        owner: {
            id: 1,
            name: 'test name',
            picture: 'http://test.picture.com'
        },
        items: [
            {
                name: "test name",
                count: 1,
                type: 'kg',
            },
            {
                name: "test name",
                count: 1,
                type: 'kg',
            }

        ]
    });
    item.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('saved item');
        }
    });
};

module.exports = ShopListManager;