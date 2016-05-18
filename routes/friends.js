var passport = require('passport');
var ModelError = require('../models/ModelError');
var validator = require('../helpers/validator');

var initialize = function (router, userHandler) {
    router.get('/',
        passport.authenticate('bearer'),
        function (req, res, next) {
            res.status(200);
            res.send(req.user.friends);
        }
    );

    router.post('/',
        passport.authenticate('bearer'),
        function (req, res, next) {
            if (!validator.isEmpty(req.body.email) && validator.isEmail(req.body.email)) {
                if (req.user.email === req.body.email) {
                    res.status(500);
                    res.send(ModelError.SelfInvitation);
                }

                userHandler.inviteFriend(req.user, req.body.email, function (error, friends) {
                    if (error) {
                        res.status(500);
                        res.send(error);
                    } else {
                        res.status(200);
                        res.send(friends);
                    }
                });
            } else if (!validator.isNotPresent(req.body.id)) {
                userHandler.acceptFriendInvitation(req.user, req.body.id, function (error, friends) {
                    if (error) {
                        res.status(500);
                        res.send(error);
                    } else {
                        res.status(200);
                        res.send(friends);
                    }
                });
            } else {
                res.status(500);
                res.send(ModelError.MissingProperties);
            }
        }
    );

    router.delete('/:id',
        passport.authenticate('bearer'),
        function (req, res, next) {
            userHandler.removeFriend(req.user, req.param('id'), function (error, friends) {
                if (error) {
                    res.status(500);
                    res.send(error);
                } else {
                    res.status(200);
                    res.send(friends);
                }
            });
        }
    );

    return router;
};

module.exports = initialize;