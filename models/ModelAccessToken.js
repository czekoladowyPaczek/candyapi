var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AccessTokenSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

var ModelAccessToken = mongoose.model('ModelAccessToken', AccessTokenSchema);
module.exports = ModelAccessToken;