var express = require('express');
var crypto = require('crypto');
var config = require('../config/config');

var router = express.Router();

function sha1(str) {
  var md5sum = crypto.createHash('sha1');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
}

/* GET users listing. */
router.get('/validate', function(req, res) {
  var signature = req.param('signature');
  var echostr = req.param('echostr');
  var valid_params = [
    req.param('timestamp'),
    req.param('nonce'),
    config.get("WEIXIN_TOKEN")
  ];
  valid_params.sort();

  var cal_signature = sha1(valid_params.join(''));
  if (signature == cal_signature) {
    res.send(echostr);
  } else {
    res.send("Bad Token!");
  }
});

module.exports = router;
