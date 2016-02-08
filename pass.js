var BearerStrategy = require('passport-http-bearer');
var ModelAccessToken = require('./models/ModelAccessToken');
var ModelUser = require('./models/ModelUser');

module.exports = function(passport) {
    passport.use(new BearerStrategy(
        function(accessToken, done) {
            console.log("auth " +accessToken);
            ModelAccessToken.findOne({token: accessToken}, function(err, token) {
                if (err) {
                    return done(err);
                }
                if (!token) {
                    return done(null, false);
                }

                ModelUser.findById(token.userId, function(err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        return done(null, false, {message: "Unknown user"});
                    }

                    done(null, user, {scope : 'all'});
                });
            });
        }
    ));
}