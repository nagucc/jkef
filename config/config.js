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
    db: 'mongodb://localhost/test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'jkef'
    },
    port: 18080,
    db: ''
  }
};

module.exports = config[env];
