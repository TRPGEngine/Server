import { EventFunc } from 'trpg/core';
import { TRPGGameMap } from './models/game-map';

/**
 * 获取所有地图列表
 */
export const getGroupMapList: EventFunc<{
  groupUUID: string;
}> = async function(data) {
  const { groupUUID } = data;
  const maps = await TRPGGameMap.getGroupMapList(groupUUID);

  return { maps };
};
