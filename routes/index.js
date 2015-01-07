var express = require('express');
var router = express.Router();

var config = require('../config/config');

var OAuth = require('wechat-oauth');
var client = new OAuth(
    config.get('WEIXIN_APP_ID'),
    config.get('WEIXIN_APP_SECRET'));

var User = require('../db/models/user');
var Season1 = require('../db/models/season1');
var async = require('async');
var Moment = require('moment');

function click_to_bang(num) {
    return parseInt(parseInt(num / 8) * 1.2);
}

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

router.post('/save', function(req, res) {
    var user = req.session.user;
    var openid = user && user.openid || '';
    // var click_count = +(req.query.click || 0);
    var click_count = +(req.body.click || 0);
    var clicks = req.body.clicks || [];

    if (!openid) {
        res.status(401).send({'msg': 'no user'});
    } else {
        User.findOne({ openid: openid }, function(err, user) {
            if (!user) {
                res.status(404).send({'msg': err});
                return;
            }
            user.game_count++;
            if (click_count > user.click_count) {
                user.click_count = click_count;
                user.clicks = clicks;
                user.updated_at = new Date();
            }
            user.save(function() {
                res.send({'msg': 'success'});
            });
        });
    }
});

router.get('/rank', function(req, res) {
    var user = req.session.user;
    var openid = user && user.openid || '';
    if (!openid) {
      res.status(401).send({'msg': 'no user'});
      return;
    }

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
                is_got_prize: 0,
                is_cheat: 0
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
                is_got_prize: 0,
                is_cheat: 0
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

router.get('/score', function(req, res) {
  var q = +req.query.q;
  var date1 = Moment(config.get('finish_dates')[0], 'YYYYMMDDHH')._d;
  var date2 = Moment(config.get('finish_dates')[1], 'YYYYMMDDHH')._d;
  var Target;
  var date;
  if (q == 1) {
    Target = Season1;
    date = date1;
  } else if (q == 2) {
    Target = User;
    date = date2;
  }
  Target.find({
    is_got_prize: 0,
    is_cheat: 0,
    updated_at: {
      '$lte': date
    }
  }).sort({click_count: -1}).limit(30).exec(function(err, users) {
    if (err) {
      res.status(500).json(err);
    } else {
      var i;
      res.jsonp(users.map(function(user, idx) {
        return [idx + 1, user._id, user.nickname, user.avatar, user.click_count];
      }));
    }
  });
});

module.exports = router;
