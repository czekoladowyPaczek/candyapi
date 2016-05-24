/**
 * Created by marcingawel on 02.03.2016.
 */
var dev = require('./dev');
var prod = require('./prod');

var Config = function(env) {
    console.log('environment: ' + env);
    if (env === 'production') {
        return prod;
    } else {
        return dev;
    }
};

module.exports = Config;