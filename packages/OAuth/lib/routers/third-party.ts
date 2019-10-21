import { TRPGRouter } from 'trpg/core';

const thirdPartyRouter = new TRPGRouter();

thirdPartyRouter.get('/enabled', (ctx) => {
  ctx.body = {
    list: ctx.trpgapp.get('oauth.enabled'),
  };
});

export default thirdPartyRouter;
