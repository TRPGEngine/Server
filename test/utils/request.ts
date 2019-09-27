import axios from 'axios';

/**
 * 用于测试的公共工具。用于发送请求给接口
 */

const port = global.port || '23256';

export const request = axios.create({
  baseURL: `http://127.0.0.1:${port}`,
});

export default request;
