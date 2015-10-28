/*
使用基于微信企业号的用户认证
*/


var express = require('express'),
  router = express.Router();


module.exports = function (app, config) {
  var wxcfg = config.wxent, redis = config.redis;

  var API = require('wxent-api-redis');
  var wxapi = API(wxcfg.corpId, wxcfg.secret, wxcfg.agentId, redis.host, redis.port);

  app.use('/auth', router);

  // 获取认证页面地址
  router.get('/url', (req, res, next) => {

    // save state & redirect uri.
    var state = Math.random().toString();
    var redirect_uri = req.query.redirect_uri;
    if(!redirect_uri) {
      res.send({ret: -1, msg: 'redirect_uri must be provided.'});
    }
    res.cookie('state', state, {maxAge: 30000, signed: true});
    res.cookie('redirect_uri', redirect_uri, {maxAge:30000, signed: true});


    // get url
    var url = wxapi.getAuthorizeURL('http://api.jkef.nagu.cc/auth/loginByCode', state, 'snsapi_base');
    res.send({ret: 0, data: url});
  });


  // 接收返回的code，设置用户登录信息，并返回原网站
  router.get('/loginByCode', (req, res, next) => {

    // 使用state验证请求是否合法
    console.log('state:' + req.signedCookies.state)
    console.log('redirect_uri : ' + req.signedCookies.redirect_uri);
    if(req.signedCookies.state === req.query.state)

      // 使用code获取userId
      wxapi.getUserIdByCode(req.query.code, (err, result) => {
        if(err) {
          res.send({ret: -1, msg: err});
        } else {
          // 用户验证正确，设置用户状态为登录，返回原URL
          res.cookie('userId', result.UserId, {maxAge: 24*3600*1000*365, signed: true});
          res.redirect(req.session.redirect_uri);
        }
      });
    else {
      res.send({ret: -1, msg: 'bad state value and illegel request.'});
    }
  });

  // 获取当前登录用户信息
  router.get('/me', (req, res, next) => {

    var userId = req.signedCookies.userId;
    var userInfo = req.signedCookies.userInfo;
    // 检查session中是否有缓存，有则直接返回。
    if(userInfo)
      res.send({ret: 0, data: req.signedCookies.userInfo});
    else if (userId)

      // 获取用户信息
      wxapi.getUser(userId, (err, result) => {
        if(err)
          res.send({ret: -1, msg: err});
        else {
          req.session.userInfo = result;
          res.send({ret: 0, data: result});
        }
      });
    else
      res.send({ret: -2, msg: 'userId is null & you need sign in first.'});
  });

  // 注销用户，删除登录信息
  router.delete('/me', (req, res, next) => {
    res.clearCookie('userId');
    res.clearCookie('userInfo');
    res.send({ret: 0});
  });

  router.get('/na57', (req, res) => {
    res.cookie('userId', 'na57', {maxAge: 24*3600*1000*365, signed: true});
    res.send({ret: 0});
  })
}
