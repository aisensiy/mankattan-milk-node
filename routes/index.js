var express = require('express');
var router = express.Router();

var config = require('../config/config');

var OAuth = require('wechat-oauth');
var client = new OAuth(
    config.get('WEIXIN_APP_ID'),
    config.get('WEIXIN_APP_SECRET'));

/* GET home page. */
router.get('/', function(req, res) {
  var user = req.session.user;
  var openid = user ? user.openid : '';
  if (!openid) {
    res.redirect(client.getAuthorizeURL(
        config.get('WX_OAUTH_REDIRECT_URL'), 'STATE', 'snsapi_userinfo'));
  } else {
    res.redirect(config.get('WX_OAUTH_REDIRECT_URL'));
  }
});

module.exports = router;
