var LocalStrategy = require('passport-local');
var BearerStrategy = require('passport-http-bearer');
var ModelUser = require('./models/ModelUser');

module.exports = function(passport) {
    passport.use(new LocalStrategy(
        {usernameField: 'email', passwordField: 'password', session: false},
        function(email, password, done) {
            ModelUser.findOne({email: email}).select('+hashedPassword +salt').exec(function(err, user){
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                if (!user.checkPassword(password)) {
                    return done(null, false);
                }
                return done(null, user);
            });
        }
    ));

    passport.use(new BearerStrategy(
        function(accessToken, done) {
            console.log("auth " + accessToken);


            ModelUser.findById(token.userId, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {message: "Unknown user"});
                }

                done(null, user, {scope: 'all'});
            });
        }
    ));
}