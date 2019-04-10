module.exports = function GroupActor(Sequelize, db) {
  let GroupActor = db.define(
    'group_actor',
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      actor_uuid: { type: Sequelize.UUID },
      actor_info: { type: Sequelize.JSON },
      avatar: { type: Sequelize.TEXT },
      passed: { type: Sequelize.BOOLEAN, defaultValue: false },
      enabled: { type: Sequelize.BOOLEAN, defaultValue: true },
    },
    {
      methods: {
        getObjectAsync: async function() {
          let actor = await this.getActor();
          return {
            uuid: this.uuid,
            actor_uuid: this.actor_uuid,
            actor_info: this.actor_info,
            avatar: this.avatar,
            passed: this.passed,
            enabled: this.enabled,
            createAt: this.createAt,
            updateAt: this.updateAt,
            actor: actor,
          };
        },
      },
    }
  );

  let User = db.models.player_user;
  if (!!User) {
    // GroupActor.hasOne('owner', User, { reverse: "groupActors" });
    GroupActor.belongsTo(User, {
      as: 'owner',
    });
  }
  let Actor = db.models.actor_actor;
  if (!!Actor) {
    // GroupActor.hasOne('actor', Actor, { reverse: "groupActors" });
    GroupActor.belongsTo(Actor, {
      as: 'actor',
    });
  }
  let Group = db.models.group_group;
  // GroupActor.hasOne('group', Group, { reverse: "groupActors" });
  GroupActor.belongsTo(Group, {
    foreignKey: 'groupId',
    as: 'group',
  });
  Group.hasMany(GroupActor, {
    foreignKey: 'groupId',
    as: 'groupActors',
  });

  return GroupActor;
};
