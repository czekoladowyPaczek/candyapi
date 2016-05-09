/**
 * Created by Marcin on 06.05.2016.
 */
var passport = require('passport');
var ModelError = require('../models/ModelError');
var validator = require('../helpers/validator');

var initialize = function (router, shopListManager) {
    router.post(
        '/',
        passport.authenticate('bearer', {session: false}),
        function(req, res, next) {
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

    return router;
};

module.exports = initialize;