/**
 * Created by Marcin on 06.05.2016.
 */
var passport = require('passport');
var ModelError = require('../models/ModelError');
var ModelShopItem = require('../models/ModelShopItem');
var Ajv = require('ajv');

var initValidator = function () {
    var ajv = new Ajv({});
    ajv.addSchema({
        'properties': {
            'name': {
                'type': 'string'
            }
        },
        'required': ['name']
    }, 'createShopList');
    ajv.addSchema({
        'properties': {
            'name': {
                'type': 'string'
            },
            'listId': {
                'type': 'string'
            },
            'count': {
                'type': 'number',
                'minimum': 0
            },
            'type': {
                'enum': [ModelShopItem.ItemType.GRAM, ModelShopItem.ItemType.KILOGRAM, ModelShopItem.ItemType.LITER,
                    ModelShopItem.ItemType.MILLILITER, ModelShopItem.ItemType.PIECE]
            }
        },
        'required': ['name', 'listId', 'count', 'type']
    }, 'createShopItem');
    return ajv;
};

var sendResponse = function(res, err, response) {
    if (err) {
        res.status(500);
        res.send(err);
    } else {
        res.status(200);
        res.send(response);
    }
};

var initialize = function (router, shopListManager) {
    var ajv = initValidator();

    router.get(
        '/',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            shopListManager.getShopLists(req.user, function (err, lists) {
                sendResponse(res, err, lists);
            });
        }
    );

    router.post(
        '/',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            if (!ajv.validate('createShopList', req.body)) {
                res.status(500);
                res.send(ModelError.MissingProperties);
            } else {
                shopListManager.createShopList(req.user, req.body.name, function (err, createdList) {
                    sendResponse(res, err, createdList);
                });
            }
        }
    );

    router.delete(
        '/:id',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            console.log("test " + req.params.id);
            shopListManager.deleteShopList(req.user, req.params.id, function (err) {
                sendResponse(res, err, {message: "deleted"});
            });
        }
    );

    router.get(
        '/:id',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            shopListManager.getShopListItems(req.user, req.params.id, function (err, items) {
                sendResponse(res, err, items);
            });
        }
    );

    router.post(
        '/:listId/item',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            if (!ajv.validate(req.body, 'createShopItem')) {
                res.status(500);
                return res.send(ModelError.MissingProperties);
            }

            var shopItem = new ModelShopItem({
                name: req.body.name,
                listId: req.params.listId,
                count: req.body.count,
                type: req.body.type
            });

            shopListManager.createShopItem(req.user, shopItem, function (err, shopItem) {
                sendResponse(res, err, shopItem);
            });
        }
    );

    router.post(
        '/:listId/item/:itemId',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {

        }
    );

    router.delete(
        '/:listId/item/:itemId',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {

        }
    );

    return router;
};

module.exports = initialize;