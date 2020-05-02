'use strict';
/**
 * 6-seeder-migrate_blank_template_data_to_information.js
 *
 */

module.exports = {
  up: async (queryInterface, Sequelize, { app }) => {
    // Here create your db insert row
    const db = app.storage.db;

    const template = await db.models.actor_template.findOne({
      where: {
        name: '空白人物模板',
        built_in: true,
      },
    });
    const templateUUID = template.uuid;
    const actors = await db.models.actor_actor.findAll({
      where: {
        template_uuid: templateUUID,
      },
      paranoid: false,
    });

    let count = 0;
    for (const actor of actors) {
      const info = { ...actor.info };
      if (info && info.data) {
        console.log(
          `迁移空白人物卡字段: data => information, 人物卡: ${actor.uuid}`
        );
        info.information = info.data;
        delete info.data;
        actor.info = { ...info };
        await actor.save();
        count++;
      }
    }

    console.log('共迁移人物卡:', count);
  },
  down: (queryInterface, Sequelize) => {
    // Optional, here code your db remove row
  },
};
