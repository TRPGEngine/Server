import _ from 'lodash';
import { EventFunc } from 'trpg/core';
import { ChatEmotionSecretSignal } from './models/secret-signal';
import { ChatEmotionCatalog } from './models/catalog';
import { ChatEmotionItem } from './models/item';

export async function getUserEmotionCatalog(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.list.find(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const userId = player.user.id;

  const user = await db.models.player_user.findByPk(userId);
  const catalogs = await user.getEmotionCatalogs();

  for (let catalog of catalogs) {
    const items = await catalog.getItems();
    _.set(catalog, 'dataValues.items', items);
  }

  return { catalogs };
}

export const addUserEmotionWithSecretSignal: EventFunc<{
  code: string;
}> = async function(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.list.find(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const { code } = data;
  const secretSignal = await ChatEmotionSecretSignal.findOne({
    where: {
      code: _.upperCase(code),
    },
    include: [
      {
        model: ChatEmotionCatalog,
        as: 'catalog',
        include: [{ model: ChatEmotionItem, as: 'items' }],
      },
    ],
    order: [['id', 'DESC']],
  });

  if (!secretSignal) {
    throw new Error('该暗号不存在');
  }

  const catalog = secretSignal.catalog;
  if (!catalog) {
    throw new Error('该表情包不存在');
  }

  const user = await (db.models.player_user as any).findByPk(player.user.id);
  await user.addEmotionCatalog(catalog);

  return { catalog };
};
