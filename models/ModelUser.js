var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    _id: {
        type: Number
    },
    email: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now,
        select: false
    }
}, {collection: 'user'});

UserSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        var retJson = {
            id: ret._id,
            name: ret.name
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