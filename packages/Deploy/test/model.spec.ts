import { DeployVersion } from '../lib/models/version';
import { mockVersionFindAll } from './dataset';

describe('models', () => {
  describe('deploy version', () => {
    beforeAll(() => {
      DeployVersion.findAll = mockVersionFindAll;
    });

    it('models findLatestVersion should be ok', async () => {
      const latestVersion = await DeployVersion.findLatestVersion();
      expect(latestVersion).toMatchObject({ version: '2.1.0' });
    });
  });
});
