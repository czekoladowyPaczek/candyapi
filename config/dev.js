var AWS = require("aws-sdk");

var Config = {};

Config.db = {};
Config.db.update = {
    region: "eu-central-1",
    endpoint: "http://localhost:8000"
};
Config.db.credentials = new AWS.SharedIniFileCredentials({profile: "development"});

module.exports.Config = Config;