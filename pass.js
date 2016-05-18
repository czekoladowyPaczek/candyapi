var BearerStrategy = require('passport-http-bearer');
var FacebookStrategy = require('passport-facebook-token');

module.exports = function(passport, config, userManager) {
    passport.use(new FacebookStrategy(
        {
            clientID: config.app_id,
            clientSecret: config.secret
        },
        function(accessToken, refreshToken, profile, done) {
            console.log(profile.id);
            console.log(profile.displayName);

            userManager.findUserById(profile.id, function(err, user){
                if (user) {
                    done(err, user);
                } else {
                    userManager.createUser(profile, function(err, user) {
                        done(err, user);
                    });
                }
            });
        }
    ));

    passport.use(new BearerStrategy(
        function(token, done){
            userManager.findUserByToken(token, done);
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
};