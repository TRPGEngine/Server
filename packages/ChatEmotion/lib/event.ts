import _ from 'lodash';
import { EventFunc } from 'trpg/core';
import { ChatEmotionSecretSignal } from './models/secret-signal';
import { ChatEmotionCatalog } from './models/catalog';
import { ChatEmotionItem } from './models/item';
import { PlayerUser } from 'packages/Player/lib/models/user';

export const getUserEmotionCatalog: EventFunc = async function getUserEmotionCatalog(
  data,
  cb,
  db
) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const catalogs = await ChatEmotionCatalog.getUserEmotionCatalogByUUID(
    player.uuid
  );

  return { catalogs };
};

export const addUserEmotionWithSecretSignal: EventFunc<{
  code: string;
}> = async function(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const player = app.player.manager.findPlayer(socket);
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

  const user = await PlayerUser.findByUUID(player.uuid);
  await (user as any).addEmotionCatalog(catalog);

  return { catalog };
};
