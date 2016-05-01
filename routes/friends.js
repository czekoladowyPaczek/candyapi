var passport = require('passport');
var ModelError = require('../models/ModelError');

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
            if (req.user.email === req.body.email) {
                res.status(500);
                res.send(ModelError.SelfInvitation);
            }

            userHandler.addFriend(req.user, req.body.email, function (error, friends) {
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

    router.delete('/',
        passport.authenticate('bearer'),
        function (req, res, next) {
            userHandler.removeFriend(req.user, req.body.id, function (error, friends) {
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