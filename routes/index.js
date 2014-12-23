var express = require('express');
var router = express.Router();

var config = require('../config/config');

var OAuth = require('wechat-oauth');
var client = new OAuth(
    config.get('WEIXIN_APP_ID'),
    config.get('WEIXIN_APP_SECRET'));

var User = require('../db/models/user');
var async = require('async');
var uv_pv_stat = require('../stat_func');

function click_to_bang(num) {
    return parseInt(parseInt(num / 8) * 1.2);
}

/* GET home page. */
router.get('/', uv_pv_stat, function(req, res) {
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
    var openid = user && user.openid || '';
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

router.get('/rank', function(req, res) {
    var user = req.session.user;
    var openid = user && user.openid || '';
    async.waterfall([
        function(next) {
            User.findOne({ openid: openid }).exec(function(err, user) {
                if (!user) {
                    next('error');
                } else {
                    next(null, user);
                }
            });
        },
        function(result, next) {
            User.count({
                click_count: { '$gt': result.click_count },
                is_got_prize: 0
            }).exec(function(err, count) {
                if (err) {
                    next('error');
                } else {
                    next(null, result, count);
                }
            })
        },
        function(result, count, next) {
            User.find({
                is_got_prize: 0
            }).sort({click_count: -1}).limit(30).exec(function(err, users) {
                if (err) {
                    next('error');
                } else {
                    next(null, result, count, users);
                }
            });
        }
    ], function(err, user, count, users) {
        if (err) {
            res.status(500).json({msg: err});
        } else {
            var i;
            var result = [[count + 1, user.nickname, user.click_count, click_to_bang(user.click_count)]];
            for (i = 0; i < users.length; i++) {
                if (users[i].openid == user.openid) {
                    continue;
                }
                result.push([
                    i + 1,
                    users[i].nickname,
                    users[i].click_count,
                    click_to_bang(users[i].click_count)
                ]);
            }
            res.json(result);
        }
    });
});

module.exports = router;
