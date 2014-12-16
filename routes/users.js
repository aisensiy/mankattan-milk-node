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
  var access_token = req.query.access_token;
  var openid = req.query.openid;

  async.waterfall([
    function(next) {
      client.getUser({
        access_token: access_token,
        openid: openid,
        lang: 'zh-CN'
      }, next);
    },
    function(result, resp, next){
      var newUser = new User({
        openid: result.openid,
        nickname: result.nickname,
        avatar: result.headimgurl && result.headimgurl.slice(0, -1) + '96'
      });
      newUser.save(function(err, result){
        next(err, result);
      });
    }
  ], function(err, result) {
      if (err) {
        res.end(err);
      } else {
        // 设置session
        var userSession = {
          openid: result.openid
        };
        req.session.user = userSession; // auto save
        res.redirect(config.get('WX_OAUTH_REDIRECT_URL'));
      }
  });
});

router.get('/get', function(req, res) {
  var code = req.query.code;
  var user = req.sessionn.user;
  var openid = user ? user.openid : '';

  // no code and no openid means no auth
  if (!code && !openid) {
    res.json({ ret: 0, msg: 'no auth' });
  }

  // if get openid from session
  if (openid) {
    async.waterfall([
      function(next) {
        User.findOne({ openid: openid }).exec(function(err, user) {
          if (user) {
            next(null, { ret: 0, user: user } );
          } else {
            next(null, { ret: 1, msg: {
              'url': '/users/create?access_token=' + result.data.access_token + '&openid=' + result.data.openid
            }});
          }
        });
      }
    ],
    function(err, result){
      //console.log('##user', err, result);
      if (err) {
        return res.json({ ret: 1 });
      } else {
        // 设置session
        var userSession = {
          openid: openid
        };
        req.session.user = userSession; // auto save
        return res.json(result);
      }
    });
  } else { // or get code
    async.waterfall([
      function(next) {
        client.getAccessToken(code, next);
      },
      function(result, next) {
        User.findOne({ openid: result.data.openid }).exec(function(err, user) {
          if (user) {
            next(null, { ret: 0, user: user } );
          } else {
            next(null, { ret: 1, msg: {
              'url': '/users/create?access_token=' + result.data.access_token + '&openid=' + result.data.openid
            }});
          }
        });
      }
    ],
    function(err, result){
      //console.log('##user', err, result);
      if (err) {
        return res.json({ ret: 1 });
      } else {
        // 设置session
        var userSession = {
          openid: openid
        };
        req.session.user = userSession; // auto save
        return res.json(result);
      }
    });
  }

});

module.exports = router;
