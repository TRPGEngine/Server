import _ from 'lodash';
import auth from 'packages/File/lib/middleware/auth';
import { ChatEmotionCatalog } from '../models/catalog';
import { TRPGRouter } from 'trpg/core';

const router = new TRPGRouter();

/**
 * 用户添加表情包
 */
router.post('/usermap/addCatalog', auth(), async (ctx) => {
  const player = _.get(ctx, 'player');
  const uuid = _.get(ctx, 'request.body.uuid');

  const catalog = await ChatEmotionCatalog.findOne({ where: { uuid } });
  const db = _.get(ctx, 'trpgapp.storage.db');
  const User = db.models.player_user;
  const user = await User.findByPk(player.user.id);
  await user.addEmotionCatalog(catalog);

  ctx.body = { catalog };
});

export default router;
