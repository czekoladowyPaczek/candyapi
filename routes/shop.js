/**
 * Created by Marcin on 06.05.2016.
 */
var passport = require('passport');

var initialize = function (router, shopListManager) {
    router.get(
        '/profile',
        passport.authenticate('bearer', {session: false}),
        function(req, res, next) {
            shopListManager.createShopList();
        }
    );

    return router;
};

module.exports = initialize;