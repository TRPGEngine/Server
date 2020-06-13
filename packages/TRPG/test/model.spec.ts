import { TRPGGameMap } from '../lib/models/game-map';
import { buildAppContext } from 'test/utils/app';
import { createTestGroup } from 'packages/Group/test/example';
import { getTestUser } from 'packages/Player/test/example';
import { createTestMap, createTestRecruit } from './example';
import testExampleStack from 'test/utils/example';
import { TRPGRecruit } from '../lib/models/recruit';

const context = buildAppContext();
testExampleStack.regAfterAll();

describe('TRPGGameMap', () => {
  test('TRPGGameMap.createGroupMap should be ok', async () => {
    const testGroup = await createTestGroup();
    const testUser = await getTestUser();

    const groupMap = await TRPGGameMap.createGroupMap(
      testGroup.uuid,
      testUser.uuid,
      'test',
      20,
      15
    );

    try {
      expect(groupMap.groupId).toBe(testGroup.id);
      expect(groupMap.name).toBe('test');
      expect(groupMap.width).toBe(20);
      expect(groupMap.height).toBe(15);
    } finally {
      groupMap.destroy({ force: true });
    }
  });

  test('TRPGGameMap.getGroupMapList should be ok', async () => {
    const testGroup = await createTestGroup();
    const testMap = await createTestMap(testGroup.id);

    const mapList = await TRPGGameMap.getGroupMapList(testGroup.uuid);
    expect(mapList).toHaveLength(1);
    expect(mapList).toHaveProperty([0, 'uuid'], testMap.uuid);
    expect(mapList).toHaveProperty([0, 'name'], testMap.name);
  });
});

describe('TRPGRecruit', () => {
  test('TRPGRecruit.getAllUserRecruitList should be ok', async () => {
    const testUser = await getTestUser();
    const testRecruit = await createTestRecruit(testUser.id);

    const recruits = await TRPGRecruit.getAllUserRecruitList(testUser.uuid);
    expect(Array.isArray(recruits)).toBe(true);
    expect(recruits.map((i) => i.id).includes(testRecruit.id)).toBe(true);
  });
});
