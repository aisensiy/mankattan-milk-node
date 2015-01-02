var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  openid: {
    type: String,
    unique: true,
    index: true
  },
  nickname: String,
  avatar: String,

  click_count: { type: Number, default: 0 },
  game_count: { type: Number, default: 0 },
  is_got_prize: { type: Number, default: 0 },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  collection: 'mankattan_season_1'
})

module.exports = mongoose.model('Season1', UserSchema);
