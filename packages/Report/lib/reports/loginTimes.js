module.exports = {
  async daily(start, end, db) {
    const app = this;
    const Op = app.storage.Op;
    let login_count = await db.models.player_login_log.count({
      createdAt: {[Op.between]: [start, end]}
    });
    let user_count = await db.models.player_login_log.aggregate('user_uuid', 'DISTINCT', {
      where: {
        createdAt: {[Op.between]: [start, end]}
      },
      plain: false,
    }).then(list => list.map(item => item['DISTINCT'])).then((list) => list.length);
    await db.models.report_login_times_daily.create({
      login_count,
      user_count,
      start,
      end,
    });
  },
  async weekly(start, end, db) {
    const app = this;
    const Op = app.storage.Op;
    let login_count = await db.models.player_login_log.count({
      createdAt: {[Op.between]: [start, end]}
    });
    let user_count = await db.models.player_login_log.aggregate('user_uuid', 'DISTINCT', {
      where: {
        createdAt: {[Op.between]: [start, end]}
      },
      plain: false,
    }).then(list => list.map(item => item['DISTINCT'])).then((list) => list.length);
    await db.models.report_login_times_weekly.create({
      login_count,
      user_count,
      start,
      end,
    });
  },
  async monthly(start, end, db) {
    const app = this;
    const Op = app.storage.Op;
    let login_count = await db.models.player_login_log.count({
      createdAt: {[Op.between]: [start, end]}
    });
    let user_count = await db.models.player_login_log.aggregate('user_uuid', 'DISTINCT', {
      where: {
        createdAt: {[Op.between]: [start, end]}
      },
      plain: false,
    }).then(list => list.map(item => item['DISTINCT'])).then((list) => list.length);
    await db.models.report_login_times_monthly.create({
      login_count,
      user_count,
      start,
      end,
    });
  },
}
