module.exports = function User(Sequelize, db) {
  let User = db.define(
    'player_user',
    {
      uuid: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV1,
      },
      username: {
        type: Sequelize.STRING,
        required: true,
        uniq: true,
      },
      password: { type: Sequelize.STRING, required: true },
      nickname: { type: Sequelize.STRING, required: false },
      avatar: { type: Sequelize.STRING, required: false, defaultValue: '' },
      last_login: { type: Sequelize.DATE },
      last_ip: { type: Sequelize.STRING },
      token: { type: Sequelize.STRING },
      app_token: { type: Sequelize.STRING },
      sex: {
        type: Sequelize.ENUM('男', '女', '其他', '保密'),
        defaultValue: '保密',
      },
      sign: { type: Sequelize.STRING },
    },
    {
      paranoid: true,
      hooks: {
        beforeSave: function(user, options) {
          if (typeof user.last_login === 'string') {
            user.last_login = new Date(user.last_login);
          }
        },
      },
      methods: {
        getName: function() {
          return this.nickname || this.username;
        },
        getInfo: function(includeToken = false) {
          return {
            username: this.username,
            nickname: this.nickname || this.username,
            uuid: this.uuid,
            last_login: this.last_login,
            createAt: this.createAt,
            id: this.id,
            avatar: this.avatar,
            token: includeToken ? this.token : '',
            app_token: includeToken ? this.app_token : '',
            sex: this.sex,
            sign: this.sign,
          };
        },
        updateInfo: function(data) {
          // 数据保护
          delete data.id;
          delete data.username;
          delete data.password;
          delete data.uuid;
          delete data.createAt;
          delete data.token;
          delete data.app_token;

          return Object.assign(this, data);
        },
      },
    }
  );

  User.belongsToMany(User, { through: 'player_friends', as: 'friend' });

  return User;
};
