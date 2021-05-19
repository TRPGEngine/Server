import { TRPGRouter } from 'trpg/core';
import _ from 'lodash';
import { ActorTemplate } from '../models/template';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import { PlayerJWTPayload } from 'packages/Player/types/player';

const templateRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

templateRouter.get('/template/list', async (ctx) => {
  const { page = 1 } = ctx.query;

  const templates = await ActorTemplate.getList(Number(page));

  ctx.body = { list: templates };
});

templateRouter.get('/template/list/recommend', async (ctx) => {
  const templates = await ActorTemplate.getRecommendList();

  ctx.body = { list: templates };
});

templateRouter.get('/template/info/:templateUUID', async (ctx) => {
  const templateUUID = ctx.params.templateUUID;

  const template = await ActorTemplate.findByUUID(templateUUID);

  ctx.body = { template };
});

/**
 * 创建模板
 */
templateRouter.post('/template/create', ssoAuth(), async (ctx) => {
  const player = ctx.state.player;
  const { name, desc, avatar, layout } = ctx.request.body;

  const template = await ActorTemplate.createTemplate(
    name,
    desc,
    avatar,
    layout,
    player.uuid
  );

  ctx.body = { template };
});

export default templateRouter;
