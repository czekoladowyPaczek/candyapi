/**
 * Created by Marcin on 06.05.2016.
 */
var passport = require('passport');
var ModelError = require('../models/ModelError');
var ModelShopItem = require('../models/ModelShopItem');
var Ajv = require('ajv');

var LENGTH_LIMIT = 50;

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
            'count': {
                'type': 'number',
                'minimum': 0
            },
            'metric': {
                'enum': [ModelShopItem.ItemType.GRAM, ModelShopItem.ItemType.KILOGRAM, ModelShopItem.ItemType.LITER,
                    ModelShopItem.ItemType.MILLILITER, ModelShopItem.ItemType.PIECE]
            }
        },
        'required': ['name', 'listId', 'count', 'type']
    }, 'createShopItem');
    ajv.addSchema({
        'properties': {
            'name': {
                'type': 'string'
            },
            'count': {
                'type': 'number',
                'minimum': 0
            },
            'metric': {
                'enum': [ModelShopItem.ItemType.GRAM, ModelShopItem.ItemType.KILOGRAM, ModelShopItem.ItemType.LITER,
                    ModelShopItem.ItemType.MILLILITER, ModelShopItem.ItemType.PIECE]
            },
            'bought': {
                'type': 'number',
                'minimum': 0
            }
        }
    }, 'updateShopItem');
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

    router.get(
        '/:id',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            shopListManager.getShopList(req.user, req.params.id, function (err, list) {
                sendResponse(res, err, list);
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
                var name;
                if (req.body.name.length > LENGTH_LIMIT) {
                    name = req.body.name.substring(0, LENGTH_LIMIT);
                } else {
                    name = req.body.name;
                }
                shopListManager.createShopList(req.user, name, function (err, createdList) {
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
        '/:id/item',
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
            if (!ajv.validate('createShopItem', req.body)) {
                res.status(500);
                return res.send(ModelError.MissingProperties);
            }
            var name;
            if (req.body.name.length > LENGTH_LIMIT) {
                name = req.body.name.substring(0, LENGTH_LIMIT);
            } else {
                name = req.body.name;
            }
            var shopItem = new ModelShopItem({
                name: name,
                listId: req.params.listId,
                count: req.body.count,
                metric: req.body.metric
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
            if (!ajv.validate('updateShopItem', req.body)) {
                res.status(500);
                return res.send(ModelError.MissingProperties);
            }
            var name;
            if (req.body.name && req.body.name.length() > LENGTH_LIMIT) {
                name = req.body.name.substring(0, LENGTH_LIMIT);
            } else {
                name = req.body.name;
            }
            const args = {
                'name': name,
                'count': req.body.count,
                'metric': req.body.metric,
                'bought': req.body.bought
            };

            shopListManager.updateShopItem(req.user, req.params.listId, req.params.itemId, args, function (err, listItem) {
                sendResponse(res, err, listItem);
            });
        }
    );

    router.delete(
        '/:listId/item/:itemId',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            shopListManager.removeShopItem(req.user, req.params.listId, req.params.itemId, function (err) {
                sendResponse(res, err, {'message': "removed"});
            });
        }
    );

    return router;
};

module.exports = initialize;