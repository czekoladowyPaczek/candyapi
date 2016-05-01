var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FriendSchema = new Schema({
    id: {
        type: Number
    },
    name: {
        type: String,
        required: true
    },
    picture: {
        type: String
    },
    status: { // A-accepted, I-invited, W-waiting acceptance
        type: String,
        required: true
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
    transform: function (doc, ret, options) {
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
    .get(function () {
        return this._id;
    })
    .set(function (id) {
        this._id = id;
    });

UserSchema.methods.removeFriend = function (id) {
    var i = this.friends.length;
    while (i--) {
        if (this.friends[i] == id) {
            this.friends.splice(i, 1);
            break;
        }
    }
};

UserSchema.methods.isFriend = function (id) {
    return this.friends.filter(function (e) {
            return e.id == id;
        }).length > 0;
};

UserSchema.methods.addFriend = function (user, status) {
    var friend = {
        id: user.id,
        name: user.name,
        picture: user.picture,
        status: status
    };
    this.friends.push(friend);
};

var ModelUser = mongoose.model('ModelUser', UserSchema);
ModelUser.FriendStatus = {
    INVITED: 'I',
    WAITING_ACCEPTANCE: 'W',
    ACCEPTED: 'A'
};

module.exports = ModelUser;