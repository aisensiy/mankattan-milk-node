var express = require('express');
var router = express.Router();

var async = require('async');
var OAuth = require('wechat-oauth');

var config = require('../config/config');

var client = new OAuth(
    config.get('WEIXIN_APP_ID'),
    config.get('WEIXIN_APP_SECRET'));

var User = require('../db/models/user');

router.get('/create', function(req, res) {
  // var openid = req.session.user && req.session.user.openid || '';
  // if (openid) {
  //   res.redirect(config.get('WX_OAUTH_REDIRECT_URL'));
  //   return;
  // }

  var access_token = req.query.access_token;
  var openid = req.query.openid;

  async.waterfall([
    // get user info
    function(next) {
      client.getUser({
        access_token: access_token,
        openid: openid,
        lang: 'zh-CN'
      }, next);
    },
    // fetch user
    function(result, resp, next) {
      User.findOne({ openid: openid }, function(err, user) {
        if (user) {
          next(null, true, user);
        } else {
          next(null, false, result);
        }
      });
    },
    function(existed, result, next) {
      if (existed) {
        next(null, result);
      } else { // if not exist, create it
        var user = new User({
          openid: result.openid,
          nickname: result.nickname,
          avatar: result.headimgurl && result.headimgurl.slice(0, -1) + '96'
        });
        user.save(function(err, result) {
          next(err, result);
        });
      }
    }
  ],
  function(err, result) {
    if (err) {
      res.json({'msg': err});
    } else {
      // create session
      var userSession = {
        openid: result.openid
      };
      req.session.user = userSession;
      res.redirect(config.get('WX_OAUTH_REDIRECT_URL'));
    }
  });
});

// if there is openid in session then get user directly
// else redirect to create user with token and openid
router.get('/get', function(req, res) {
  var user = req.session.user;
  var code = req.query.code;
  var openid = user ? user.openid : '';

  // no code and no openid means no auth
  if (!code && !openid) {
    res.json({ ret: 1, url: '/' });
    return;
  }

  // if get openid from session then fetch user
  if (openid && !code) {
    async.waterfall([
      function(next) {
        User.findOne({ openid: openid }).exec(function(err, user) {
          if (user) {
            next(null, { ret: 0, user: user } );
          } else {
            next('no user find in db');
          }
        });
      }
    ],
    function(err, result){
      if (err) {
        console.log('error in get openid from session', err, result);
        return res.json({ ret: 1, msg: err });
      } else {
        var userSession = {
          openid: openid
        };
        req.session.user = userSession;
        return res.json(result);
      }
    });
  } else { // or get code
    async.waterfall([
      function(next) {
        client.getAccessToken(code, next);
      },
      function(result, next) {
        next(null, {
          ret: 1,
          url: '/users/create?access_token=' + result.data.access_token + '&openid=' + result.data.openid
        });
      }
    ],
    function(err, result){
      if (err) {
        console.log('get code error', err, result);
        return res.json({ ret: 1 });
      } else {
        return res.json(result);
      }
    });
  }
});

module.exports = router;
