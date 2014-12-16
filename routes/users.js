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
  var code = req.param.code;

  async.waterfall([
    function(next) {
      client.getAccessToken(code, next);
    },
    function(result, next) {
      client.getUser({
        access_token: result.data.access_token,
        openid: result.data.openid,
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
      if(err) {
        res.end(err);
      } else {
        // 设置session
        var userSession = {
          openid: result.openid
        };
        req.session.user = userSession; // auto save
        res.redirect('/');
      }
  });
});

router.get('/get', function(req, res) {
  if (!req.session.user) {
    res.redirect(client.getAuthorizeURL(
        ['http://', config.get('DOMAIN'), '/users/create'], 'STATE', 'snsapi_userinfo'))
  }
  var user = req.session.user;
  var openid = user.openid;

  async.waterfall([
    function(next) {
      User.findOne({ openid: openid }).exec(function(err, user) {
        next(null, { ret: 0, user: user } );
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
});

module.exports = router;
