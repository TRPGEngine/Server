import { OAuthApp } from 'packages/OAuth/lib/models/app';
import { OAuthCode } from 'packages/OAuth/lib/models/code';
import { getTestUser } from 'packages/Player/test/example';
import testExampleStack from 'test/utils/example';
import { generateRandomStr } from 'test/utils/utils';

/**
 * 创建一条测试OAuth应用
 */
export async function createTestOAuthApp(): Promise<OAuthApp> {
  const user = await getTestUser();
  const testOAuthApp = await OAuthApp.create({
    appid: generateRandomStr(),
    appsecret: generateRandomStr(),
    name: generateRandomStr(6),
    ownerId: user.id,
  });

  testExampleStack.append(testOAuthApp);

  return testOAuthApp;
}

/**
 * 创建一条测试OAuth授权
 */
export async function createTestOAuthCode(
  appid: string,
  userId: number
): Promise<OAuthCode> {
  const testOAuthCode = await OAuthCode.create({
    appid,
    code: generateRandomStr(),
    scope: 'public',
    expiredAt: new Date().setDate(new Date().getDate() + 1), // 测试数据过期时间一天
    userId,
  });

  testExampleStack.append(testOAuthCode);

  return testOAuthCode;
}
