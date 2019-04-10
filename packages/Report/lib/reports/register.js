module.exports = {
  async daily(start, end, db) {
    const app = this;
    const Op = app.storage.Op;
    let count = await db.models.player_user.count({
      createdAt: {[Op.between]: [start, end]}
    });
    await db.models.report_register_daily.create({
      count,
      start,
      end,
    });
  },
  async weekly(start, end, db) {
    const app = this;
    const Op = app.storage.Op;
    let count = await db.models.player_user.count({
      createdAt: {[Op.between]: [start, end]}
    });
    await db.models.report_register_weekly.create({
      count,
      start,
      end,
    });
  },
  async monthly(start, end, db) {
    const app = this;
    const Op = app.storage.Op;
    let count = await db.models.player_user.count({
      createdAt: {[Op.between]: [start, end]}
    });
    await db.models.report_register_monthly.create({
      count,
      start,
      end,
    });
  },
}
