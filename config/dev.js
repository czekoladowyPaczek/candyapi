var AWS = require("aws-sdk");

function Config() {
    this.db = {};
    this.db.update = {
        region: "eu-central-1",
        endpoint: "http://localhost:8000"
    };
    this.db.credentials = new AWS.SharedIniFileCredentials({profile: "development"});
}

module.exports = Config;