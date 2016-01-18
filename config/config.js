var Config = function(app) {
    var cfg;
    if (app.get('env') === 'production') {
        cfg = require("./prod.js").Config;
    } else {
        cfg = require("./dev.js").Config;
    }
    return cfg;
}

module.exports.Config = Config;


