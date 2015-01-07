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
  clicks: { type: Array, default: [] },
  game_count: { type: Number, default: 0 },
  is_got_prize: { type: Number, default: 0 },
  is_cheat: { type: Number, default: 0 },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

