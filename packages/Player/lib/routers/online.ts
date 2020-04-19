import { TRPGRouter } from 'trpg/core';
const onlineRouter = new TRPGRouter();

onlineRouter.get('/online/count', async (ctx) => {
  const trpgapp = ctx.trpgapp;
  const count = await trpgapp.player.manager.getOnlinePlayerCount(true);

  ctx.body = { count };
});

onlineRouter.get('/online/count/device', async (ctx) => {
  const trpgapp = ctx.trpgapp;
  const count = await trpgapp.player.manager.getOnlinePlayerCount(false);

  ctx.body = { count };
});

onlineRouter.get('/online/detail', async (ctx) => {
  const trpgapp = ctx.trpgapp;
  const list = await trpgapp.player.manager.getOnlinePlayerList();

  ctx.body = { list };
});

export default onlineRouter;
