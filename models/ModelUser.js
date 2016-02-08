var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required : true
    },
    hashedPassword: {
        type: String,
        required: true,
        select: false
    },
    salt: {
        type: String,
        required: true,
        select: false
    },
    created: {
        type: Date,
        default: Date.now,
        select: false
    }
});

UserSchema.methods.encryptPassword = function(password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
}

UserSchema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

UserSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(128).toString('hex');
    this.hashedPassword = this.encryptPassword(password);
};

UserSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        var retJson = {
            id: ret._id,
            email: ret.email,
            name: ret.name
        };
        return retJson;
    }
});

UserSchema.virtual('id')
    .get(function() {
        return this._id;
    });

var ModelUser = mongoose.model('ModelUser', UserSchema);

module.exports = ModelUser;