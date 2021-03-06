module.exports.Unknown = {code: 0, message: "Unknown"};
module.exports.MissingProperties = {code: 1, message: "Missing fields"};
module.exports.MissingEmail = {code: 2, message: "Missing email"};
module.exports.IncorrectToken = {code: 3, message: "Incorrect token"};
module.exports.IncorrectEmail = {code: 4, message: "Incorrect email"};
module.exports.EmailAlreadyExists = {code: 5, message: "Email already exists"};
module.exports.NoUser = {code: 6, message: "Could not find user"};
// friends
module.exports.SelfInvitation = {code: 21, message: "Can't invite self"};
module.exports.AlreadyFriend = {code: 22, message: "User is already on friend list"};
module.exports.NotInvited = {code: 23, message: "User was not invited"};
// shop list
module.exports.ListCountLimitExceeded = {code: 31, message: "List count limit exceeded"};
module.exports.ListNotExist = {code: 32, message: "List doesn't exist or you are not permitted"};
module.exports.NotPermitted = {code: 33, message: "Not permitted"};
// shop list invitations
module.exports.CannotInviteSelf = {code: 41, message: "Cannot invite self"};
module.exports.CannotRemoveOwner = {code: 42, message: "Cannot remove owner"};
module.exports.UserIsNotInvited = {code: 43, message: "User is not invited for this list"};
module.exports.AlreadyInvited = {code: 44, message: "User is already invited for this list"};
module.exports.NotOnFriendList = {code: 45, message: "User is not on your friend list or didn't accept invitation"};
module.exports.CannotRemoveSelf = {code: 46, message: "Cannot remove self"};
module.exports.ListSizeLimitExceeded = {code: 47, message: "Shop list has too many items"};
//shop list item
module.exports.ShopItemNotChanged = {code: 51, message: "Nothing to change"};
module.exports.ShopItemNotExists = {code: 52, message: "Item doesn't exists"};