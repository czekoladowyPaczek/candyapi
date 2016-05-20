/**
 * Created by Marcin on 06.05.2016.
 */
var passport = require('passport');
var ModelError = require('../models/ModelError');
var ModelShopItem = require('../models/ModelShopItem');
var Ajv = require('ajv');

var initValidator = function() {
    var ajv = new Ajv({});
    ajv.addSchema({
        'properties': {
            'name' : {
                'type': 'string'
            }
        },
        'required': ['name']
    }, 'postShopList');
    return ajv;
};

var initialize = function (router, shopListManager) {
    var ajv = initValidator();

    router.get(
        '/',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            shopListManager.getShopLists(req.user, function (err, lists) {
                if (err) {
                    res.status(500);
                    res.send(err);
                } else {
                    res.status(200);
                    res.send(lists);
                }
            });
        }
    );

    router.post(
        '/',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            if (!ajv.validate('postShopList', req.body)) {
                res.status(500);
                res.send(ModelError.MissingProperties);
            } else {
                shopListManager.createShopList(req.user, req.body.name, function (err, createdList) {
                    if (err) {
                        res.status(500);
                        res.send(err);
                    } else {
                        res.status(200);
                        res.send(createdList);
                    }
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
                if (err) {
                    res.status(500);
                    res.send(err);
                } else {
                    res.status(200);
                    res.send({message: "deleted"});
                }
            });
        }
    );

    router.get(
        '/:id',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            shopListManager.getShopListItems(req.user, req.params.id, function (err, items) {
                if (err) {
                    res.status(500);
                    res.send(err);
                } else {
                    res.status(200);
                    res.send(items);
                }
            });
        }
    );

    router.post(
        '/:listId/item',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            var shopItem = new ModelShopItem({
                name: req.body.name,
                listId: req.params.listId,
                count: req.body.count,
                type: req.body.type
            });
            shopListManager.createShopItem(req.user, req.params.listId, function () {

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