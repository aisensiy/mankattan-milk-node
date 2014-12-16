var mongoose = require('mongoose');
var config = require('../config/config');

var connect = function () {
  mongoose.connect('mongodb://' + config.get('DB_HOST') + ':' + config.get('DB_PORT') + '/' + config.get('DB_NAME'));
}
connect();

var db = mongoose.connection;
db.on('open', function callback () {
  console.log('connected to mongodb');
});
db.on('error', console.error.bind(console, 'connection error:'));
db.on('disconnected', connect);

module.exports = mongoose;
