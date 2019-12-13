import { buildAppContext } from 'test/utils/app';
import { ActorTemplate } from '../lib/models/template';
import { createTestActor } from './example';
import { getTestUser } from 'packages/Player/test/example';
import testExampleStack from 'test/utils/example';
import { ActorActor } from '../lib/models/actor';

buildAppContext();

testExampleStack.regAfterAll();

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

describe('ActorActor', () => {
  test('ActorActor.remove should be ok', async () => {
    const testActor = await createTestActor();
    const testUser = await getTestUser();
    await ActorActor.remove(testActor.uuid, testUser.uuid);

    expect(
      await ActorActor.findOne({
        where: {
          uuid: testActor.uuid,
        },
      })
    ).toBeNull();
  });
});
