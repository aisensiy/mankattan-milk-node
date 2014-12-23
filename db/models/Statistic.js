var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StatisticSchema = new Schema({
  date: String,
  hour: String,
  uv: { type: Number, default: 0 },
  pv: { type: Number, default: 0 },
  share: { type: Number, default: 0 },
  uv_users: [],
  share_users: []
});

module.exports = mongoose.model('Statistic', StatisticSchema);