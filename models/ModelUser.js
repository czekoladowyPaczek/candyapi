var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FriendStatus = {
    INVITED: 'I',
    WAITING_ACCEPTANCE: 'W',
    ACCEPTED: 'A'
};

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
    },
    status: { // A-accepted, I-invited, W-waiting acceptance
        type: String,
        required: true,
        enum: [FriendStatus.ACCEPTED, FriendStatus.INVITED, FriendStatus.WAITING_ACCEPTANCE]
    }
});

FriendSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        var retJson = {
            id: ret._id,
            name: ret.name,
            picture: ret.picture,
            status: ret.status
        };
        return retJson;
    }
});

FriendSchema.virtual('id')
    .get(function () {
        return this._id;
    })
    .set(function (id) {
        this._id = id;
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
        if (this.friends[i].id == id) {
            this.friends.splice(i, 1);
            break;
        }
    }
};

UserSchema.methods.isFriend = function (id) {
    return this.friends.filter(function (e) {
            return e.id == id && e.status == ModelUser.FriendStatus.ACCEPTED;
        }).length > 0;
};

UserSchema.methods.isOnFriendList = function (id) {
    return this.friends.filter(function (e) {
            return e.id == id;
        }).length > 0;
};

UserSchema.methods.inviteFriend = function (user, status) {
    var friend = {
        id: user.id,
        name: user.name,
        picture: user.picture,
        status: status
    };
    this.friends.push(friend);
};

UserSchema.methods.isInvited = function (id) {
    return this.friends.filter(function (e) {
            return e.id == id && e.status == ModelUser.FriendStatus.INVITED;
        }).length > 0;
};

UserSchema.methods.acceptFriendInvitation = function (id) {
    var friends = this.friends.filter(function (e) {
        return e.id == id;
    });
    friends[0].status = ModelUser.FriendStatus.ACCEPTED;
};

var ModelUser = mongoose.model('ModelUser', UserSchema);
ModelUser.FriendStatus = FriendStatus;

module.exports = ModelUser;