/**
 * Created by Marcin on 18.05.2016.
 */
var passport = require('passport');
var ModelError = require('../models/ModelError');
var Ajv = require('ajv');

var initValidator = function() {
    var ajv = new Ajv({});
    ajv.addSchema({
        'properties': {
            'listId' : {
                'type': 'string'
            },
            'userId': {
                'type': 'number'
            }
        },
        'required': ['listId', 'userId']
    }, 'invitation');
    return ajv;
};

var initialize = function (router, shopListManager) {
    var ajv = initValidator();

    router.post(
        '/',
        passport.authenticate('bearer', {session: false}),
        function (req, res, next) {
            if (!ajv.validate('invitation', req.body)) {
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
            if (!ajv.validate('invitation', req.body)) {
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