import { buildAppContext } from 'test/utils/app';
import { getTestUser } from 'packages/Player/test/example';
import { ChatEmotionCatalog } from '../lib/models/catalog';

const context = buildAppContext();

describe('ChatEmotionCatalog', () => {
  test('ChatEmotionCatalog.getUserEmotionCatalogByUUID should be ok', async () => {
    const testUser = await getTestUser();
    const catalogs = await ChatEmotionCatalog.getUserEmotionCatalogByUUID(
      testUser.uuid
    );

    expect(Array.isArray(catalogs)).toBe(true);
    if (catalogs.length > 0) {
      expect(catalogs[0]).toHaveProperty('items');
    }
  });
});
