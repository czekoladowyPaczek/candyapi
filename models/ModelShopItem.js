/**
 * Created by Marcin on 09.05.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
        type: Date,
        expires: 172800 // 2 days
    }
}, {collection: 'shop_item'});

var ModelShopItem = mongoose.model('ModelShopItem', ItemSchema);
module.exports = ModelShopItem;