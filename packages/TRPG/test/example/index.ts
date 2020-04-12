import { TRPGGameMap } from 'packages/TRPG/lib/models/game-map';
import testExampleStack from 'test/utils/example';

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
