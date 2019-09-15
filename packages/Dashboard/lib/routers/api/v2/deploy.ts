import Router from 'koa-router';
const router = new Router();
import _ from 'lodash';
import { DeployVersion } from 'packages/Deploy/lib/models/version';

router.post('/create', async (ctx, next) => {
  const data = _.get(ctx, 'request.body');
  const { version, platform, downloadUrl, describe } = data;

  const trpgapp = ctx.trpgapp;
  const info: DeployVersion = await DeployVersion.create({
    version,
    platform,
    downloadUrl,
    describe,
  });

  ctx.body = {
    result: true,
    version: info,
  };
});

module.exports = router;
