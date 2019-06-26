import uuid from 'uuid/v1';

module.exports = function Invite(Sequelize, db) {
  let Invite = db.define(
    'player_invite',
    {
      uuid: {
        type: Sequelize.STRING,
        required: false,
        unique: true,
      },
      from_uuid: { type: Sequelize.STRING, required: true },
      to_uuid: { type: Sequelize.STRING, required: true },
      is_agree: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_refuse: { type: Sequelize.BOOLEAN, defaultValue: false },
    },
    {
      hooks: {
        beforeCreate: function(invite) {
          if (!invite.uuid) {
            invite.uuid = uuid();
          }
        },
      },
      methods: {},
    }
  );

  return Invite;
};
