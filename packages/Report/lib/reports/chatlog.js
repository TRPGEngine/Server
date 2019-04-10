module.exports = {
  async daily(start, end, db) {
    const app = this;
    const Op = app.storage.Op;
    let count = await db.models.chat_log.count({
      date: {[Op.between]: [start, end]}
    });
    await db.models.report_chatlog_daily.create({
      count,
      start,
      end,
    });
  },
  async weekly(start, end, db) {
    const app = this;
    const Op = app.storage.Op;
    let count = await db.models.chat_log.count({
      date: {[Op.between]: [start, end]}
    });
    await db.models.report_chatlog_weekly.create({
      count,
      start,
      end,
    });
  },
  async monthly(start, end, db) {
    const app = this;
    const Op = app.storage.Op;
    let count = await db.models.chat_log.count({
      date: {[Op.between]: [start, end]}
    });
    await db.models.report_chatlog_monthly.create({
      count,
      start,
      end,
    });
  },
}
