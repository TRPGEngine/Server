import { ChatEmotionCatalog } from './models/catalog';
import { Op } from 'trpg/core';

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

  return { catalogs };
}
