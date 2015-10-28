var express = require('express');
var glob = require('glob');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var cors = require('cors');
var config = require('./config');

module.exports = function(app, config) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser('jkef.nagu.cc cookie key'));
  app.use(compress());
  app.use(methodOverride());

  app.use(session({
    store: new RedisStore({
      host: config.redis.host,
      port: config.redis.port
    }),
    secret: 'jkef.nagu.cc session key',
    resave: true,
    saveUninitialized: false,
    cookie: {
      path    : '/',
      httpOnly: false,
      maxAge  : 24*60*60*1000
    },
  }));

  app.use(cors({
    origin: function (origin, cb) {
      cb(null, true);
    },
    credentials: true
  }));

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach(function (controller) {
    require(controller)(app, config);
  });
};
