var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', passport.authenticate('bearer', {session: false}), function(req, res) {
  res.json(req.user);
});

module.exports = router;
