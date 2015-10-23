var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'jkef'
    },
    port: 18080,
    db: 'localhost/jkef',
    wxent: {
      corpId: process.env.WXE_CORPID,
      secret: process.env.WXE_SECRET,
      angetId: process.env.WXE_AGENTID
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    }
  },

  production: {
    port: 18080,
    db: process.env.MONGO_URL,
    wxent: {
      corpId: process.env.WXE_CORPID,
      secret: process.env.WXE_SECRET,
      angetId: process.env.WXE_AGENTID
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    }
  }
};

module.exports = config[env];
