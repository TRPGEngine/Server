const path = require('path');
const ignore = require('../../nodemon.json').ignore;

module.exports = {
  apps: [
    {
      name: 'trpg-server',
      script: 'standard.js',
      cwd: path.resolve(__dirname, '../../'),
      max_restarts: 10,
      env: {
        NODE_ENV: 'development',
        DEBUG: 'trpg:*',
      },
      watch: true,
      ignore_watch: ignore,
    },
  ],
};
