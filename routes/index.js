var express = require('express');
var router = express.Router();

var User = require('../models/User');

/* GET home page. */
router.get('/', function(req, res, next) {
    var user = new User({"name":"name", "email":"email@email.com"});
    res.send(user);
    user.save(function(err){

    });
});

module.exports = router;
