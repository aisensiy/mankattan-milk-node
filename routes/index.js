var express = require('express');
var router = express.Router();

var config = require('../config/config');

var OAuth = require('wechat-oauth');
var client = new OAuth(
    config.get('WEIXIN_APP_ID'),
    config.get('WEIXIN_APP_SECRET'));

var User = require('../db/models/user');

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

router.get('/save', function(req, res) {
    var user = req.session.user;
    var openid = '11';
    var click_count = +(req.query.click || 0);
    if (!openid) {
        res.status(401).send({'msg': 'no user'});
    } else {
        User.findOne({ openid: openid }, function(err, user) {
            if (!user) {
                res.status(404).send({'msg': err});
                return;
            }
            user.game_count++;
            user.click_count = user.click_count > click_count ? user.click_count : click_count;
            user.updated_at = new Date();
            user.save(function() {
                res.send({'msg': 'success'});
            });
        });
    }
});

module.exports = router;
