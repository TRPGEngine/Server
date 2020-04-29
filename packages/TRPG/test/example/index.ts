import { TRPGGameMap } from 'packages/TRPG/lib/models/game-map';
import testExampleStack from 'test/utils/example';
import { TRPGRecruit } from 'packages/TRPG/lib/models/recruit';

export async function createTestMap(groupId: number): Promise<TRPGGameMap> {
  const testMap = await TRPGGameMap.create({
    name: 'test map',
    width: 20,
    height: 15,
    groupId,
  });

  testExampleStack.append(testMap);

  return testMap;
}

/**
 * 创建测试用的招募信息
 * @param playerId 创建者Id
 */
export async function createTestRecruit(
  playerId: number
): Promise<TRPGRecruit> {
  const testRecruit = await TRPGRecruit.create({
    title: 'test example title',
    content: 'test example content',
    author: 'xxx',
    ownerId: playerId,
  });

  testExampleStack.append(testRecruit);

  return testRecruit;
}
