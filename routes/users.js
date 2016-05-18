var passport = require('passport');

var initialize = function (router, userHandler) {
    router.get(
        '/login',
        passport.authenticate('facebook-token', {session: false}),
        function (req, res, next) {
            console.log('get');
            if (req.user) {
                var response = {};
                response.token = userHandler.createToken(req.user);
                response.user = req.user;
                res.status(200);
                res.send(response);
            } else {
                res.send(401);
            }

        }
    );

    router.get(
        '/profile',
        passport.authenticate('bearer', {session: false}),
        function(req, res, next) {
            if (req.user) {
                var response = {
                    user: req.user
                };
                res.status(200);
                res.send(response);
            } else {
                res.send(401);
            }
        }
    );

    return router;
};

module.exports = initialize;