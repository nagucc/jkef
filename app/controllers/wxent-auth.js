/*
使用基于微信企业号的用户认证
*/


var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Acceptor = mongoose.model('Acceptor');
  
var config = require('../../config/config'),
  wxcfg = config.wxent,
  redis = config.redis;

var API = require('wxent-api-redis');
module.exports = function (app) {
  app.use('/auth', router);
}


var getRedirectUri = function (req, res, next) {
  
}
// 获取认证页面地址
router.get('/url', function (req, res, next) {
  var wxapi = API(wxcfg.corpId, wxcfg.secret, wxcfg.agentId, redis.host, redis.port);
  var url = wxapi.getAuthorizeURL('http://jkef.nagu.cc', 'state', 'snsapi_base');
  res.send({ret: 0, data: url});
});
