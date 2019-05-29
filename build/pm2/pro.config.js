const path = require('path');

module.exports = {
  apps: [
    {
      name: 'trpg-server',
      script: 'standard.js',
      cwd: path.resolve(__dirname, '../../'),
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        PORT: '23256',
        VERBOSE: 'true',
        DEBUG: 'trpg:*',
      },
    },
  ],
};
