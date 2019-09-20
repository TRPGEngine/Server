export const mockDataset = {
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

export const mockVersionFindAll = jest
  .fn()
  .mockImplementation(() => Promise.resolve(mockDataset.version));
