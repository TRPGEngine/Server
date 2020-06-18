import { getGlobalApplication } from 'lib/application';
import _ from 'lodash';
import url from 'url';
import { BotOperationLog } from './models/operation-log';

/**
 * 接口说明
 * https://cqhttp.cc/docs/4.15/#/API
 */

interface CQHttpResp {
  status: 'ok' | 'async' | 'failed';
  retcode: number;
  data: object;
}

/**
 * 发送到coolq插件机器人
 * @param path 请求方法路径
 */
export async function requestCQHttp(path: string, data: object) {
  const app = getGlobalApplication();
  const baseUrl = app.get('bot.qqbot.url');
  const accessToken = app.get('bot.qqbot.accessToken');

  if (_.isNil(baseUrl) || baseUrl === '') {
    throw new Error('无法请求CQHttp: 配置不正确');
  }

  const res: CQHttpResp = await app.request.post(
    url.resolve(baseUrl, path),
    data,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // 异步插入日志
  BotOperationLog.insertLog('sendMsg', {
    request: data,
    response: res,
  });

  if (res.status === 'failed') {
    throw new Error(`${path} error: ${JSON.stringify(res)}`);
  }
}
