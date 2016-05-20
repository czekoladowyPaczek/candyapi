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
    listId: {
        type: Schema.ObjectId,
        required: true,
        index: true
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

ItemSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        var retJson = {
            id: ret._id,
            name: ret.name,
            count: ret.count,
            type: ret.type,
            modification_date: ret.modification_date
        };
        return retJson;
    }
});

var ModelShopItem = mongoose.model('ModelShopItem', ItemSchema);
module.exports = ModelShopItem;