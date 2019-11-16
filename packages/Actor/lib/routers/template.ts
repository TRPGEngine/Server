import { TRPGRouter } from 'trpg/core';
import _ from 'lodash';
import { ActorTemplate } from '../models/template';

const templateRouter = new TRPGRouter();

templateRouter.get('/template/list', async (ctx) => {
  const { page = 1 } = ctx.query;

  const templates = await ActorTemplate.getList(page);

  ctx.body = { list: templates };
});

templateRouter.get('/template/info/:templateUUID', async (ctx) => {
  const templateUUID = ctx.params.templateUUID;

  const template = await ActorTemplate.findByUUID(templateUUID);

  ctx.body = { template };
});

export default templateRouter;
