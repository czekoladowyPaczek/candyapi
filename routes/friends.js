var passport = require('passport');

var initialize = function (router, userHandler) {
    router.get('/',
        passport.authenticate('bearer'),
        function (req, res, next) {
            if (req.user) {
                res.status(200);
                res.send(req.user.friends);
            } else {
                res.send(401);
            }
        }
    );

    router.post('/',
        passport.authenticate('bearer'),
        function (req, res, next) {
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
        passport.authenticate('beraer'),
        function (req, res, next) {

        }
    );

    return router;
};

module.exports = initialize;