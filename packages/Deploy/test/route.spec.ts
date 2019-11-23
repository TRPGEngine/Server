import _ from 'lodash';
import { mockVersionFindAll } from './dataset';
import { buildAppContext } from 'test/utils/app';

const context = buildAppContext();

describe('route', () => {
  beforeAll(() => {
    _.set(global.db, 'models.deploy_version.findAll', mockVersionFindAll);
  });

  it('/deploy/version/latest', async () => {
    const res = await context.request.get('/deploy/version/latest');
    expect(res.body.version).toMatchObject({ version: '2.1.0' });
  });
});
