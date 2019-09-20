import Router from 'koa-router';
import _ from 'lodash';
import { DeployVersion } from '../models/version';

const router = new Router();

/**
 * 获取最新版本
 */
router.get('/version/latest', async (ctx) => {
  const platform = ctx.params.platform || 'android';

  const version = await DeployVersion.findLatestVersion(platform);

  ctx.body = { version };
});

export default router;
