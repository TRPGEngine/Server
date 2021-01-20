import { getTestUser } from 'packages/Player/test/example';
import { buildAppContext } from 'test/utils/app';
import { regAutoClear } from 'test/utils/example';
import { OAuthApp } from '../lib/models/app';
import { OAuthCode } from '../lib/models/code';
import { createTestOAuthApp, createTestOAuthCode } from './example';

const context = buildAppContext();

regAutoClear();

describe('OAuthApp', () => {
  test('OAuthApp.getAppInfo should be ok', async () => {
    const testApp = await createTestOAuthApp();
    const app = await OAuthApp.getAppInfo(testApp.appid);

    const data = app;

    expect(data).toHaveProperty('appid');
    expect(data).not.toHaveProperty('appsecret');
  });

  test('OAuthApp.createApp should be ok', async () => {
    const testUser = await getTestUser();
    const app = await OAuthApp.createApp(
      {
        name: 'test',
      },
      testUser.uuid
    );

    try {
      expect(app.name).toBe('test');
    } finally {
      await app.destroy();
    }
  });
});

describe('OAuthCode', () => {
  test('OAuthCode.createCode should be ok', async () => {
    const testUser = await getTestUser();
    const testApp = await createTestOAuthApp();

    const code = await OAuthCode.createCode(
      testApp.appid,
      ['public'],
      testUser.uuid
    );

    try {
      expect(typeof code).toBe('string');
    } finally {
      await OAuthCode.destroy({
        where: {
          code,
        },
      });
    }
  });

  test('OAuth.verifyCode should be ok', async () => {
    const testUser = await getTestUser();
    const testOAuthApp = await createTestOAuthApp();
    const testOAuthCode = await createTestOAuthCode(
      testOAuthApp.appid,
      testUser.id
    );

    const verifiedCode = await OAuthCode.verifyCode(
      testOAuthApp.appid,
      testOAuthApp.appsecret,
      testOAuthCode.code
    );
    expect(verifiedCode.appid).toBe(testOAuthCode.appid);
    expect(verifiedCode.appid).toBe(testOAuthApp.appid);
  });

  test('OAuth.getUserPublicScope should be ok', async () => {
    const testUser = await getTestUser();
    const testOAuthApp = await createTestOAuthApp();
    const testOAuthCode = await createTestOAuthCode(
      testOAuthApp.appid,
      testUser.id
    );

    const user = await OAuthCode.getUserPublicScope(
      testOAuthApp.appid,
      testOAuthApp.appsecret,
      testOAuthCode.code
    );

    expect(user.id).toBe(testUser.id);
    expect(user.username).toBe(testUser.username);
  });
});
