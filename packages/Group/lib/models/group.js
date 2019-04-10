const uuid = require('uuid/v1');

module.exports = function Group(Sequelize, db) {
  let Group = db.define(
    'group_group',
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      type: { type: Sequelize.ENUM('group', 'channel', 'test') },
      name: { type: Sequelize.STRING },
      sub_name: { type: Sequelize.STRING },
      desc: { type: Sequelize.STRING },
      avatar: { type: Sequelize.STRING, defaultValue: '' },
      creator_uuid: { type: Sequelize.STRING, required: true },
      owner_uuid: { type: Sequelize.STRING, required: true },
      managers_uuid: { type: Sequelize.JSON, defaultValue: [] },
      maps_uuid: { type: Sequelize.JSON, defaultValue: [] },
    },
    {
      paranoid: true,
      hooks: {
        beforeCreate: function() {
          if (!Array.isArray(this.managers_uuid)) {
            this.managers_uuid = [];
          }
          if (this.managers_uuid.indexOf(this.owner_uuid) === -1) {
            this.managers_uuid.push(this.owner_uuid);
          }
        },
      },
      methods: {
        isManagerOrOwner: function(uuid) {
          if (
            this.creator_uuid === uuid ||
            this.owner_uuid === uuid ||
            this.managers_uuid.indexOf(uuid) >= 0
          ) {
            return true;
          } else {
            return false;
          }
        },
        getManagerUUIDs: function() {
          return Array.from(
            new Set([this.owner_uuid].concat(this.managers_uuid))
          );
        },
      },
    }
  );

  let User = db.models.player_user;
  if (!!User) {
    Group.belongsTo(User, {
      as: 'owner',
    });

    // 定义group members的中间模型
    let GroupMembers = db.define('group_group_members', {
      selected_group_actor_uuid: { type: Sequelize.STRING },
    });
    User.belongsToMany(Group, {
      through: GroupMembers,
      as: 'groups',
    });
    Group.belongsToMany(User, {
      through: GroupMembers,
      as: 'members',
    });
  }

  return Group;
};
