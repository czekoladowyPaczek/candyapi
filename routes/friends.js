var passport = require('passport');

var initialize = function(router, userHandler) {
    router.get('/',
        passport.authenticate('bearer'),
        function(req, res, next) {

        }
    );

    return router;
};

module.exports = initialize;