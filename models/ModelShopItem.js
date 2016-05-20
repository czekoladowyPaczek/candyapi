/**
 * Created by Marcin on 09.05.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemType = {
    PIECE: 'pcs',
    GRAM: 'g',
    KILOGRAM: 'kg',
    MILLILITER: 'ml',
    LITER: 'l'
};

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
        type: Number,
        required: true
    },
    bought: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        required: true,
        enum: [ItemType.GRAM, ItemType.KILOGRAM, ItemType.LITER, ItemType.MILLILITER, ItemType.PIECE]
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
ModelShopItem.ItemType = ItemType;
module.exports = ModelShopItem;