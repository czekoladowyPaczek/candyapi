var config = function(app) {
    var cfg;

    if (app.get('env') === 'production') {
        cfg = require("./prod.js");
    } else {
        cfg = require("./dev.js");
    }

    return cfg;
}

module.exports.config = config;


