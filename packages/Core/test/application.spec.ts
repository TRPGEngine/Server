import _ from 'lodash';
import { buildAppContext } from 'test/utils/app';
import { getGlobalApplication } from 'lib/application';
import Application from 'packages/Core/lib/application';

const context = buildAppContext();

describe('application', () => {
  test('application ioserver should be ok', () => {
    expect(_.isNil(context.app)).toBe(false);
    expect(_.isNil(context.app.socketservice)).toBe(false);
  });

  test('application global getter should be ok', () => {
    expect(getGlobalApplication()).toBeTruthy();
    expect(getGlobalApplication() instanceof Application).toBe(true);
  });
});
