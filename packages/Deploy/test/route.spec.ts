import request from 'test/utils/request';
import _ from 'lodash';
import { mockVersionFindAll } from './dataset';

describe('route', () => {
  beforeAll(() => {
    _.set(global.db, 'models.deploy_version.findAll', mockVersionFindAll);
  });

  it('/deploy/version/latest', async () => {
    const res = await request.get('/deploy/version/latest');
    expect(res.data.version).toMatchObject({ version: '2.1.0' });
  });
});
