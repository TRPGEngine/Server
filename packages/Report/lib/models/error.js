module.exports = function ReportError(Sequelize, db) {
  let ReportError = db.define('report_error', {
    ip: { type: Sequelize.STRING, required: true },
    ua: { type: Sequelize.STRING },
    version: { type: Sequelize.STRING },
    message: { type: Sequelize.STRING, required: true },
    stack: { type: Sequelize.TEXT, required: true },
  });

  return ReportError;
};
