import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { TRPGRouter } from 'trpg/core';
import { checkDBLink, checkRedisLink } from '../../utils/net-helper';
import { CoreStats } from '../models/stats';

const router = new TRPGRouter();
const hostname = os.hostname();

const rootDir = path.resolve(__dirname, '../../../../../');

const getServerInfo = memoizeOne(
  (): Promise<{
    packageConf: {};
    gitVersion: string;
  }> => {
    return Promise.all([
      fs.readJson(path.resolve(rootDir, './package.json')),
      fs
        .readFile(path.resolve(rootDir, './.git/HEAD'), {
          encoding: 'utf-8',
        })
        .then((head) => {
          const ref = _.last(head.split(' ')).trim();
          return fs.readFile(path.resolve(rootDir, `./.git/${ref}`), {
            encoding: 'utf-8',
          });
        })
        .catch((err) => '-'),
    ]).then(([packageConf, gitVersion]) => ({
      packageConf,
      gitVersion: gitVersion.trim(),
    }));
  }
);

/**
 * 健康检查
 */
router.get('/health', async (ctx) => {
  const serverInfo = await getServerInfo();
  const trpgapp = ctx.trpgapp;

  ctx.body = {
    version: _.get(serverInfo, 'packageConf.version', ''),
    hash: _.get(serverInfo, 'gitVersion', ''),
    env: trpgapp.get('env'),
    components: trpgapp.installedPackages,
    hostname,
  };
});

/**
 * 获取一个请求的上下文信息
 * 用于调试
 */
router.get('/context', (ctx) => {
  ctx.body = {
    header: ctx.header,
    ip: ctx.ip,
    ips: ctx.ips,
  };
});

/**
 * 获取统计信息
 */
router.get('/stats', async (ctx) => {
  const stats = await CoreStats.getAllStats();
  ctx.body = { stats };
});

/**
 * 检查依赖联通
 */
router.get('/dependServiceCheck', async (ctx) => {
  const isDBAvailable = await checkDBLink()
    .then(() => true)
    .catch(() => false);

  const isRedisAvailable = await checkRedisLink()
    .then(() => true)
    .catch(() => false);

  ctx.body = {
    hostname,
    isDBAvailable,
    isRedisAvailable,
  };
});

router.get('/availableSocketEvents', (ctx) => {
  const trpgapp = ctx.trpgapp;
  ctx.body = trpgapp.socketservice.events.map((e) => e.name);
});

export default router;
