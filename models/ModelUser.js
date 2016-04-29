var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FriendSchema = new Schema({
    _id: {
        type: Number
    },
    name: {
        type: String,
        required: true
    },
    picture: {
        type: String
    }
});

var UserSchema = new Schema({
    _id: {
        type: Number
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now,
        select: false
    },
    picture: {
        type: String
    },
    friends: {
        type: [FriendSchema]
    }
}, {collection: 'user'});

UserSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        var retJson = {
            id: ret._id,
            name: ret.name,
            email: ret.email,
            picture: ret.picture,
            friends: ret.friends
        };
        return retJson;
    }
});

UserSchema.virtual('id')
    .get(function(){
        return this._id;
    })
    .set(function(id){
        this._id = id;
    });

var ModelUser = mongoose.model('ModelUser', UserSchema);

module.exports = ModelUser;