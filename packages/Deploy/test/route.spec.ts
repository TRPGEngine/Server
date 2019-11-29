import { buildAppContext } from 'test/utils/app';
import _ from 'lodash';
import { mockVersionFindAll } from './dataset';
import { DeployVersion } from '../lib/models/version';

const context = buildAppContext();

describe('route', () => {
  beforeAll(() => {
    DeployVersion.findAll = mockVersionFindAll;
  });

  it('/deploy/version/latest', async () => {
    const res = await context.request.get('/deploy/version/latest');
    expect(res.body.version).toMatchObject({ version: '2.1.0' });
  });
});
