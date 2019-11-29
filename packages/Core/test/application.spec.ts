import _ from 'lodash';
import { buildAppContext } from 'test/utils/app';

const context = buildAppContext();

describe('application', () => {
  test('application ioserver should be ok', () => {
    expect(_.isNil(context.app)).toBe(false);
    expect(_.isNil(context.app.socketservice)).toBe(false);
  });
});
