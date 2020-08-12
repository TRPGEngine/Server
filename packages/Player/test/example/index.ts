import md5Encrypt from 'packages/Player/lib/utils/md5';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { TRPGAppInstanceContext } from 'test/utils/app';
import { sleep } from 'lib/helper/utils';
import testExampleStack from 'test/utils/example';
import { PlayerLoginLog } from 'packages/Player/lib/models/login-log';
import { PlayerInvite } from 'packages/Player/lib/models/invite';

export const testUserInfo = {
  username: 'admin10',
  password: md5Encrypt('admin'),
};

/**
 * 用户登录
 * @param context 测试应用上下文
 */
export const handleLogin = async (
  context: TRPGAppInstanceContext
): Promise<PlayerUser> => {
  const ret = await context.emitEvent('player::login', testUserInfo);
  await sleep(500); // 保证登录的token能写到数据库中

  const testUser = await getTestUser();

  return testUser;
};

/**
 * 用户登出
 * @param context 测试应用上下文
 */
export const handleLogout = async (
  context: TRPGAppInstanceContext,
  testUser?: PlayerUser
) => {
  if (_.isNil(testUser)) {
    testUser = await getTestUser();
  }
  await context.emitEvent('player::logout', {
    uuid: testUser.uuid,
    token: testUser.token,
  });
};

/**
 * 获取测试用户
 */
export const getTestUser = memoizeOne(
  async (): Promise<PlayerUser> => {
    return await PlayerUser.findByUsernameAndPassword(
      testUserInfo.username,
      testUserInfo.password
    );
  }
);

/**
 * 获取其他的测试用户
 */
export const getOtherTestUser = memoizeOne(
  async (username: string): Promise<PlayerUser> => {
    return await PlayerUser.findByUsernameAndPassword(
      username,
      testUserInfo.password
    );
  }
);

/**
 * 生成测试用户的JWT
 */
export const genTestPlayerJWT = async (
  username = testUserInfo.username
): Promise<string> => {
  const player = await getOtherTestUser(username);
  const playerUUID = player.uuid;
  const jwt = await PlayerUser.signJWT(playerUUID);

  return jwt;
};

/**
 * 发送post请求时自动带上x-token的header
 */
export function sendPostWithToken<T extends object = any>(
  context: TRPGAppInstanceContext,
  username?: string
) {
  return async (url: string, data: {}, headers?: {}) => {
    const jwt = await genTestPlayerJWT(username);
    return context.request.post<T>(url, data, {
      'X-Token': jwt,
      ...headers,
    });
  };
}

/**
 * 创建一条测试登录记录
 */
export async function createTestPlayerLoginLog(): Promise<PlayerLoginLog> {
  const testUser = await getTestUser();
  const testPlayerLoginLog = await PlayerLoginLog.create({
    user_uuid: testUser.uuid,
    type: 'token',
    platform: 'test platform',
    device_info: {},
    ip: '127.0.0.1',
    token: 'test_token',
    is_success: true,
  });

  testExampleStack.append(testPlayerLoginLog);

  return testPlayerLoginLog;
}

/**
 * 创建一条测试的好友邀请
 */
export async function createTestPlayerInvite(): Promise<PlayerInvite> {
  const testUser = await getTestUser();
  const testInvite = await PlayerInvite.create({
    from_uuid: testUser.uuid,
    to_uuid: 'any test uuid',
  });

  testExampleStack.append(testInvite);

  return testInvite;
}
