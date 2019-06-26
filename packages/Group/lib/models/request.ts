module.exports = function Request(Sequelize, db) {
  let Request = db.define(
    'group_request',
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      group_uuid: { type: Sequelize.UUID, required: true },
      from_uuid: { type: Sequelize.UUID, required: true },
      is_agree: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_refuse: { type: Sequelize.BOOLEAN, defaultValue: false },
    },
    {
      methods: {
        agreeAsync: async function() {
          this.is_agree = true;
          this.is_refuse = false;
          return await this.save();
        },
        refuseAsync: async function() {
          this.is_agree = false;
          this.is_refuse = true;
          return await this.save();
        },
      },
    }
  );

  return Request;
};
