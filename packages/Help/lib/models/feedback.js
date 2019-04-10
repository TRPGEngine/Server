module.exports = function HelpFeedback(Sequelize, db) {
  let HelpFeedback = db.define(
    'help_feedback',
    {
      username: { type: Sequelize.STRING, required: true },
      contact: { type: Sequelize.STRING },
      content: { type: Sequelize.STRING(1000), required: true },
    },
    {
      hooks: {},
      methods: {},
    }
  );

  return HelpFeedback;
};
