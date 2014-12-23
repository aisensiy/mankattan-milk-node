var Statistic = require('db/models/Statistic');
var Moment = require('moment');

function uv_pv_stat(req, res) {
  var openid = req.session.user && req.session.user.openid || '';
  if (openid) {
    var date = Moment().format('YYYYMMDD');
    var hour = Moment().format('HH');

    async.waterfall([
        function(next) {
          Statistic.findOne({date: date, hour: hour}).exec(function(err, stat) {
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
                next(err, result);
              });
            } else {
              stat.pv++;
              if (stat.uv_users.indexOf(openid) == -1) {
                stat.uv_users.push(openid);
                stat.uv++;
              }
              stat.save(function(err, result) {
                next(err, result);
              });
            }
          });
        }
      ],
      function(err, result) {
      });
  }
  next();
}

module.exports = uv_pv_stat;