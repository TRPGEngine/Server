module.exports = function NotifyJPush(Sequelize, db) {
  let NotifyJPush = db.define(
    'notify_jpush',
    {
      user_uuid: {
        type: Sequelize.UUID,
        required: true,
      },
      user_tags: {
        type: Sequelize.JSON,
      },
    },
    {
      methods: {
        addTag(tag) {
          const tags = this.user_tags;
          tags.push(tag);
          return this.save();
        },
      },
    }
  );

  let User = db.models.player_user;
  if (!!User) {
    NotifyJPush.belongsTo(User, { as: 'user' });
  }

  return NotifyJPush;
};
