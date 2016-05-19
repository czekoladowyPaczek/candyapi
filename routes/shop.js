/**
 * Created by Marcin on 06.05.2016.
 */
var passport = require('passport');
var ModelError = require('../models/ModelError');
var validator = require('../helpers/validator');

var initialize = function (router, shopListManager) {
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
        '/',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            if (validator.isEmpty(req.body.name)) {
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

    return router;
};

module.exports = initialize;