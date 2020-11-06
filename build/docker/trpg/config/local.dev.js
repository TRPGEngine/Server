module.exports = {
  db: {
    database: 'trpg',
    password: 'devpass',
    options: {
      host: 'mysql',
    },
  },
  redisUrl: 'redis://redis:6379/8',
  jwt: {
    secret: "please_change_it!",
  },
};
