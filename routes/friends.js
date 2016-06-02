var passport = require('passport');
var ModelError = require('../models/ModelError');
var Ajv = require('ajv');

var initValidator = function() {
    var ajv = new Ajv({});
    ajv.addSchema({
        'properties': {
            'email' : {
                'type': 'string',
                'format': 'email'
            }
        },
        'required': ['email']
    }, 'createInvitation');
    ajv.addSchema({
        'properties': {
            'userId' : {
                'type': 'number'
            }
        },
        'required': ['userId']
    }, 'acceptInvitation');
    return ajv;
};

var initialize = function (router, userHandler) {
    var ajv = initValidator();

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
            if (ajv.validate(req.body, 'createInvitation')) {
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
            } else if (ajv.validate(req.body, 'acceptInvitation')) {
                userHandler.acceptFriendInvitation(req.user, req.body.userId, function (error, friends) {
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
            userHandler.removeFriend(req.user, req.params.id, function (error, friends) {
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