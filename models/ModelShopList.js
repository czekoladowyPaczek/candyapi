/**
 * Created by Marcin on 05.05.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    _id: {
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
});

UserSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        var retJson = {
            id: ret._id,
            name: ret.name,
            picture: ret.picture
        };
        return retJson;
    }
});

var ListSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: UserSchema,
        required: true
    },
    users: {
        type: [UserSchema]
    },
    modification_date: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Date,
        expires: 172800 //2 days
    }
}, {collection: "shop_list"});

ListSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        var retJson = {
            id: ret._id,
            name: ret.name,
            owner: ret.owner,
            users: ret.users,
            modification_date: ret.modification_date
        };
        return retJson;
    }
});

var ModelShopList = mongoose.model('ModelShopList', ListSchema);
module.exports = ModelShopList;