import { buildAppContext } from 'test/utils/app';
import { regAutoClear } from 'test/utils/example';
import { OAuthApp } from '../lib/models/app';
import { createTestOAuthApp } from './example';

const context = buildAppContext();

regAutoClear();

describe('OAuthApp', () => {
  test('OAuthApp.getAppInfo should be ok', async () => {
    const testApp = await createTestOAuthApp();
    const app = await OAuthApp.getAppInfo(testApp.appid);

    const data = app.toJSON();

    expect(data).toHaveProperty('appid');
    expect(data).not.toHaveProperty('appsecret');
  });
});
