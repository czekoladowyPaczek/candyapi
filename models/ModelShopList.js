/**
 * Created by Marcin on 05.05.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    id: {
        type: Number,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    picture: {
        type: String
    }
}, {_id: false});

var ItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    count: {
        type: Number
    },
    type: {
        type: String
    },
    modification_date: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Date
    }
});

var ListSchema = new Schema({
    owner: {
        type: UserSchema,
        required: true
    },
    items: {
        type: [ItemSchema]
    },
    modification_date: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Date
    }
}, {collection: "shop_list"});

var ModelShopList = mongoose.model('ModelShopList', ListSchema);
module.exports = ModelShopList;