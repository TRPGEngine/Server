module.exports = function ReportError(Sequelize, db) {
  let ReportError = db.define('report_error', {
    ip: { type: Sequelize.STRING, required: true },
    ua: { type: Sequelize.TEXT },
    version: { type: Sequelize.STRING },
    message: { type: Sequelize.TEXT, required: true },
    stack: { type: Sequelize.TEXT, required: true },
  });

  return ReportError;
};
