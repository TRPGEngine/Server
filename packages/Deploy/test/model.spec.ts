import { DeployVersion } from '../lib/models/version';

const mockDataset = {
  version: [
    {
      version: '1.0.0',
    },
    {
      version: '2.1.0',
    },
    {
      version: '1.1.0',
    },
  ],
};

describe('models', () => {
  describe('deploy version', () => {
    beforeAll(() => {
      DeployVersion.findAll = jest
        .fn()
        .mockImplementation(() => Promise.resolve(mockDataset.version));
    });

    it('models findLatestVersion should be ok', async () => {
      const latestVersion = await DeployVersion.findLatestVersion();
      expect(latestVersion).toMatchObject({ version: '2.1.0' });
    });
  });
});
