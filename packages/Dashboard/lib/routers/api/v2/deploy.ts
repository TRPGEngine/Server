import _ from 'lodash';
import { DeployVersion } from 'packages/Deploy/lib/models/version';
import { TRPGRouter } from 'trpg/core';

const router = new TRPGRouter();

router.post('/create', async (ctx, next) => {
  const data = _.get(ctx, 'request.body');
  const { version, platform, downloadUrl, describe } = data;

  const trpgapp = ctx.trpgapp;
  const info: DeployVersion = await DeployVersion.create({
    version,
    platform,
    download_url: downloadUrl,
    describe,
  });

  ctx.body = {
    result: true,
    version: info,
  };
});

module.exports = router;
