import {
  SocketManager,
  SocketManagerOptions,
  BaseSocketMsgPayload,
} from 'packages/Core/lib/managers/socket-manager';

/**
 * NOTICE:
 * map 功能需要有独立的socket管理方式
 *
 * 因为player-manager管理socket是与用户强关联，而map的socket无需登录也应当能观看
 */

const CHANNEL_KEY = 'map:manager:channel';
class MapManager extends SocketManager {
  getRoomKey = (key: string) => `map:manager:room#${key}`;

  constructor(options: SocketManagerOptions) {
    super(CHANNEL_KEY, options);
  }
}

let mapManager: MapManager;

/**
 * 获取玩家状态管理器
 * @param options 配置项，仅在第一次获取时有效
 */
export const getMapManager = (options: SocketManagerOptions) => {
  if (!mapManager) {
    mapManager = new MapManager(options);
  }

  return mapManager;
};

export type MapManagerCls = MapManager;
