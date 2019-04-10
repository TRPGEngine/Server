module.exports = function Log(Sequelize, db) {
  let DiceLog = db.define(
    'dice_log',
    {
      uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
      sender_uuid: { type: Sequelize.UUID, required: false },
      to_uuid: { type: Sequelize.UUID, required: false },
      is_group: { type: Sequelize.BOOLEAN },
      is_private: { type: Sequelize.BOOLEAN },
      dice_request: { type: Sequelize.STRING },
      dice_expression: { type: Sequelize.STRING(1000) },
      dice_result: { type: Sequelize.INTEGER },
      date: { type: Sequelize.DATE },
    },
    {
      hooks: {},
      methods: {},
    }
  );

  return DiceLog;
};
