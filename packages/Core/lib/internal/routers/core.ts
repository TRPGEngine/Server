import fs from 'fs-extra';
import path from 'path';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { TRPGRouter } from 'trpg/core';
const router = new TRPGRouter();

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

router.get('/health', async (ctx) => {
  const serverInfo = await getServerInfo();
  const trpgapp = ctx.trpgapp;
  ctx.body = {
    version: _.get(serverInfo, 'packageConf.version', ''),
    hash: _.get(serverInfo, 'gitVersion', ''),
    env: trpgapp.get('env'),
  };
});

export default router;
