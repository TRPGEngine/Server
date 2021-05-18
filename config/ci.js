module.exports = {
  port: 23266,
  db: {
    database: 'trpg_ci',
    options: {
      benchmark: true,
    },
    pool: {
      max: 1,
      min: 0,
    },
  },
  etcd: {
    enable: false,
    host: 'http://127.0.0.1:2379',
  },
  redisUrl: 'redis://127.0.0.1:6379',
  report: {
    enable: false,
  },
  jwt: {
    secret: 'circle-ci-jwt-secret',
  },
  bot: {
    enable: true,
  },
};
