import Router from 'koa-router';
import _ from 'lodash';
import auth from 'packages/File/lib/middleware/auth';
import { ChatEmotionCatalog } from '../models/catalog';

const router = new Router();

/**
 * 用户添加表情包
 */
router.post('/usermap/addCatalog', auth(), async (ctx) => {
  const player = ctx.player;
  const { uuid } = ctx.request.body;

  const catalog = await ChatEmotionCatalog.findOne({ where: { uuid } });
  const db = ctx.trpgapp.storage.db;
  const User = db.models.player_user;
  const user = await User.findByPk(player.user.id);
  await user.addEmotionCatalog(catalog);

  ctx.body = { catalog };
});

export default router;
