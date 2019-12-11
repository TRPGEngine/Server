import { buildAppContext } from 'test/utils/app';
import { ActorTemplate } from '../lib/models/template';

buildAppContext();

describe('ActorTemplate', () => {
  test('ActorTemplate.getList should be ok', async () => {
    const templates = await ActorTemplate.getList();

    expect(templates.length).toBeGreaterThanOrEqual(1);
    expect(templates.length).toBeLessThanOrEqual(10); // 返回结果不能大于10(默认)

    for (const t of templates) {
      // 返回结果只能是公开的
      expect(t.is_public).toBe(true);
    }
  });

  test('ActorTemplate.getRecommendList should be ok', async () => {
    const templates = await ActorTemplate.getRecommendList();

    expect(templates.length).toBeGreaterThanOrEqual(1);
    for (const t of templates) {
      expect(t.is_public).toBe(true);
      expect(t.built_in).toBe(true);
    }
  });
});
