var Config = function(app) {
    var cfg;

    if (app.get('env') === 'production') {
        cfg = require("./prod.js");
    } else {
        cfg = require("./dev.js");
    }

    return new cfg;
}

module.exports.Config = Config;


