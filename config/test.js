module.exports = {
  port: 23266,
  db: {
    database: 'trpg_test',
    options: {
      benchmark: true,
    },
    pool: {
      max: 1,
      min: 0,
    },
  },
  report: {
    enable: false,
  },
  rateLimit: {
    register: {
      // 方便测试
      points: 99999999,
      duration: 1
    },
  },
  bot: {
    enable: true,
  },
};
