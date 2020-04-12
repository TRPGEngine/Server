import { MapData } from 'packages/TRPG/types/map';
import _ from 'lodash';

export function isAllowEditMap(mapData: MapData, playerUUID: string) {
  const editablePlayer = mapData.editablePlayer ?? [];
  return _.includes(editablePlayer, playerUUID);
}

/**
 * 检查是否允许编辑地图
 * 如果不允许直接抛出异常
 * @param mapData 地图数据
 * @param playerUUID 操作人UUID
 */
export function checkAllowEditMap(mapData: MapData, playerUUID: string) {
  if (!isAllowEditMap(mapData, playerUUID)) {
    throw new Error('编辑失败: 没有编辑地图的权限');
  }
}
