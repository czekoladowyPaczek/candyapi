/**
 * Created by Marcin on 18.05.2016.
 */
var passport = require('passport');
var ModelError = require('../models/ModelError');
var validator = require('../helpers/validator');

var initialize = function (router, shopListManager) {
    router.post(
        '/',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            if (validator.isEmpty(req.body.listId) || validator.isNotPresent(req.body.userId)) {
                res.status(500);
                res.send(ModelError.MissingProperties);
            } else if (req.user.id == req.body.userId) {
                res.status(500);
                res.send(ModelError.CannotInviteSelf);
            } else {
                shopListManager.addUserToShopList(req.user, req.body.userId, req.body.listId, function (err) {
                    if (err) {
                        res.status(500);
                        res.send(err);
                    } else {
                        res.status(200);
                        res.send();
                    }
                });
            }
        }
    );

    router.delete(
        '/',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            if (validator.isEmpty(req.body.listId) || validator.isNotPresent(req.body.userId)) {
                res.status(500);
                res.send(ModelError.MissingProperties);
                return;
            }

            if (req.user.id == req.body.userId) {
                res.status(500);
                res.send(ModelError.CannotRemoveSelf);
            }

            shopListManager.deleteUserFromShopList(req.user, req.body.userId, req.body.listId, function(err) {
                if (err) {
                    res.status(500);
                    res.send(err);
                } else {
                    res.status(200);
                    res.send({message: "removed"});
                }
            });
        }
    );

    return router;
};

module.exports = initialize;