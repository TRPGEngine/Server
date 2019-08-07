import request from 'umi-request';
import { FromDataType } from './index';

export async function fakeAccountLogin(params: FromDataType) {
  return request('/api/login/account', {
    method: 'POST',
    data: params,
  });
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}

export async function userLogin(username: string, password: string) {
  return request.post(`/dashboard/api/v2/system/login`, {
    data: {
      username,
      password,
    },
  });
}
