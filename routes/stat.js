var express = require('express');
var router = express.Router();
var Statistic = require('../db/models/statistic');
var Moment = require('moment');


router.get('/stat_result', function(req, res) {
  Statistic.find({}, 'date hour uv pv share', function(err, results) {
    res.json(results.map(function(elem, index) {
      return [elem.date, elem.hour, elem.pv, elem.uv, elem.share];
    }));
  });
});

router.get('/update_share', function(req, res) {
  var openid = req.session.user && req.session.user.openid || '';

  if (openid) {
    var date = Moment().format('YYYYMMDD');
    var hour = Moment().format('HH');

    Statistic.findOne({date: date, hour: hour}, function(err, stat) {
      if (!stat) {
        var new_stat = new Statistic({
          date: date,
          hour: hour,
          pv: 0,
          uv: 0,
          share: 1,
          uv_users: [],
          share_users: [openid]
        });
        new_stat.save(function(err, result) {
          res.json({date: new Date()});
        });
      } else {
        if (stat.share_users.indexOf(openid) == -1) {
          stat.share_users.push(openid);
          stat.share++;
        }
        stat.save(function(err, result) {
          res.json({date: new Date()});
        });
      }
    });
  }
});

router.get('/update_uv_pv', function (req, res) {
  var openid = req.session.user && req.session.user.openid || '';
  if (openid) {
    var date = Moment().format('YYYYMMDD');
    var hour = Moment().format('HH');

    Statistic.findOne({date: date, hour: hour}, function(err, stat) {
      if (!stat) {
        var new_stat = new Statistic({
          date: date,
          hour: hour,
          pv: 1,
          uv: 1,
          share: 0,
          uv_users: [openid],
          share_users: []
        });
        new_stat.save(function(err, result) {
          res.json({date: new Date()});
        });
      } else {
        stat.pv++;
        if (stat.uv_users.indexOf(openid) == -1) {
          stat.uv_users.push(openid);
          stat.uv++;
        }
        stat.save(function(err, result) {
          res.json({date: new Date()});
        });
      }
    });
  } else {
    res.sendStatus(200);
  }
});

module.exports = router;