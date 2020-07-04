require('dotenv').config();
import axios from 'axios';
import crypto from 'crypto';
import qs from 'querystring';

/**
 * ################################################
 * ################################ NOTE: 暂时不可用
 * ################################################
 */

/**
 * ################################################
 * ######################################## 环境变量
 * ################################################
 */
const BDUSS = process.env.BDUSS; // 身份信息
const REPLY_TIEBA_NAME = process.env.REPLY_TIEBA_NAME; // 贴吧名
const REPLY_TID = process.env.REPLY_TID; // 帖子id
const REPLY_MSG = process.env.REPLY_MSG; // 回帖内容
const REPLY_MSG_SUFFIX = process.env.REPLY_MSG_SUFFIX;

// 发送信息
console.table({ REPLY_TIEBA_NAME, REPLY_TID, REPLY_MSG });

const REPLY_POST_URL = 'http://c.tieba.baidu.com/c/c/post/add';
const TBS_URL = 'http://tieba.baidu.com/dc/common/tbs';
const TIEBA_FID =
  'http://tieba.baidu.com/f/commit/share/fnameShareApi?ie=utf-8&fname='; //获取贴吧fid

/**
 * 获取TBS
 * TBS是一个重要参数
 */
async function getTBS(): Promise<string> {
  const { data } = await axios.get(TBS_URL, {
    headers: {
      Cookie: `BDUSS=${BDUSS}`,
    },
  });
  console.log('[GET TBS]', JSON.stringify(data));
  return data.tbs;
}

/**
 * 根据贴吧名获取贴吧ID
 */
async function getFid(tbName: string): Promise<number> {
  const { data } = await axios.get(TIEBA_FID + encodeURIComponent(tbName));

  if (data.error !== '') {
    throw new Error('获取贴吧fid出错' + data);
  }

  return data.data?.fid;
}

function getRandomClientType(): number {
  // 1, "iPhone" ),//苹果客户端
  // 2, "Android"),//安卓客户端
  // 3, "WindowsPhone"),//wp客户端
  // 4, "Windows 8");//win8/10客户端

  return Math.floor(Math.random() * 4) + 1;
}

function md5Sign(data: {}): string {
  let str = '';
  Object.entries(data).forEach(([key, value]) => {
    str += `${key}=${value}`;
  });
  str += 'tiebaclient!!!';

  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex')
    .toUpperCase();
}

/**
 * 获取固顶帖总楼层数
 */
async function getFloorCount(): Promise<number> {
  const { data } = await axios.get(
    `http://tieba.baidu.com/mo/m?kz=${REPLY_TID}&last=1`,
    {
      headers: {
        Referer: 'http://tieba.baidu.com/mo/',
      },
    }
  );

  const floor = String(data).match(/<div class="i">(\d*?)楼/)[1];

  console.log(`帖子 ${REPLY_TID} 的总楼层数为: ${floor}`);
  return Number(floor);
}

/**
 * 实现参考自: github.com/libsgh/tieba-api
 */
async function reply1() {
  const body: any = {
    BDUSS,
    _client_id: 'wappc_1450693793907_490',
    _client_type: getRandomClientType(),
    _client_version: '6.2.2',
    _phone_imei: '864587027315606',
    anonymous: '0',
    content: REPLY_MSG,
    fid: await getFid(REPLY_TIEBA_NAME),
    kw: REPLY_TIEBA_NAME,
    net_type: '3',
    tbs: await getTBS(),
    tid: Number(REPLY_TID),
    title: '',
  };
  body.sign = md5Sign(body);

  const { data, status } = await axios.post(
    REPLY_POST_URL,
    qs.stringify(body),
    {
      headers: {
        Cookie: `BDUSS=${BDUSS}`,
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
    }
  );

  console.log('回复结果:', status, data);
}

/**
 * 实现参考自 https://github.com/shfshanyue/tieba_post/blob/master/tieba.py
 */
async function reply2() {
  const floorNum = await getFloorCount();
  const content = REPLY_MSG + new Array(floorNum % 20).join(REPLY_MSG_SUFFIX);
  const body = {
    ie: 'utf-8',
    kw: REPLY_TIEBA_NAME,
    fid: String(await getFid(REPLY_TIEBA_NAME)),
    tid: REPLY_TID,
    content,
    is_login: 1,
    rich_text: '1',
    tbs: await getTBS(),
    __type__: 'reply',
  };

  console.log('-----------------------');

  const { data, status } = await axios.post(
    'https://tieba.baidu.com/f/commit/post/add',
    qs.stringify(body),
    {
      headers: {
        Host: 'tieba.baidu.com',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:42.0) Gecko/20100101 Firefox/42.0',
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        DNT: '1',
        Cookie: `BDUSS=${BDUSS}`,
      },
    }
  );

  if (data.err_code === 0) {
    console.log('回复成功', JSON.stringify(data));
  } else {
    console.log('回复失败:', status, data);
    throw new Error(data);
  }
}

reply2();
