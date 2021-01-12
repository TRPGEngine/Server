import { OAuthApp } from 'packages/OAuth/lib/models/app';
import { getTestUser } from 'packages/Player/test/example';
import testExampleStack from 'test/utils/example';
import { generateRandomStr } from 'test/utils/utils';

/**
 * 创建一条测试应用
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
