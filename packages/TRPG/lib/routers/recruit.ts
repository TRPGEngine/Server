import { TRPGRouter } from 'trpg/core';
import { TRPGRecruit } from '../models/recruit';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import _ from 'lodash';

const recruitRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

recruitRouter.get('/recruit/feed', async (ctx) => {
  const feed = await TRPGRecruit.getTRPGRecruitFeed();

  ctx.body = feed;
  ctx.type = 'application/rss+xml';
});

recruitRouter.get('/recruit/list', async (ctx) => {
  const list = await TRPGRecruit.getTRPGRecruitList();

  ctx.body = { list };
});

recruitRouter.post('/recruit/create', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const {
    title,
    content,
    platform,
    contactType,
    contactContent,
  } = ctx.request.body;

  const recruit = await TRPGRecruit.createTRPGRecruit(
    playerUUID,
    title,
    content,
    platform,
    contactType,
    contactContent
  );

  ctx.body = { recruit };
});

recruitRouter.post('/recruit/:uuid/update', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const data = ctx.request.body;
  const recruitUUID = ctx.params.uuid;

  const recruit = await TRPGRecruit.updateTRPGRecruit(
    playerUUID,
    recruitUUID,
    _.pick(data, TRPGRecruit.EDITABLE_FIELD)
  );

  ctx.body = { recruit };
});

recruitRouter.post('/recruit/:uuid/completed', ssoAuth(), async (ctx) => {
  const playerUUID = ctx.state.player.uuid;
  const recruitUUID = ctx.params.uuid;

  await TRPGRecruit.completeTRPGRecruit(playerUUID, recruitUUID);

  ctx.body = { result: true };
});

export default recruitRouter;
