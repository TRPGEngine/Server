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
};
