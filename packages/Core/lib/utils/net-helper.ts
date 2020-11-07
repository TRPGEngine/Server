import net from 'net';
import config from 'config';
import _ from 'lodash';
import url from 'url';

/**
 * 检查连接是否可用
 * @param host 地址
 * @param port 端口
 */
export async function portAvailableCheck(host: string, port: number) {
  return new Promise((resolve, reject) => {
    const client = net.connect({
      host,
      port,
      timeout: 3000,
    });

    client.on('connect', () => {
      client.end();
      resolve();
    });

    client.on('error', () => {
      client.end();
      reject();
    });
  });
}

export async function checkDBLink() {
  const host = _.get(config, 'db.options.host', 'localhost');
  const port = _.get(config, 'db.options.port', 3306);

  await portAvailableCheck(host, port);
}

export async function checkRedisLink() {
  const redisUrl = _.get(config, 'redisUrl', '');
  const info = url.parse(redisUrl);
  await portAvailableCheck(info.hostname, Number(info.port));
}
