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
    db: 'mongodb://localhost/jkef',
    wxent: {
      corpId: process.env.WXE_CORPID,
      secret: process.env.WXE_SECRET,
      angetId: process.env.WXE_AGENTID,
      adminRoleId: process.env.ADMIN_ROLE_ID
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    }
  },

  production: {
    port: 18080,
    db: process.env.MONGO_URL,
    wxent: {
      corpId: process.env.WXE_CORPID,
      secret: process.env.WXE_SECRET,
      angetId: process.env.WXE_AGENTID,
      adminRoleId: process.env.ADMIN_ROLE_ID
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    }
  }
};

module.exports = config[env];
