import { EventFunc } from 'trpg/core';
import _ from 'lodash';
import { TRPGGameMap } from './models/game-map';
import { MapUpdateType, UpdateTokenPayloadMap } from '../types/map';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { notifyUpdateOnlineSocketList } from './map-notify';
import Debug from 'debug';
const debug = Debug('trpg:package:trpg:map:event');

/**
 * 创建团地图
 */
export const createGroupMap: EventFunc<{
  groupUUID: string;
  name: string;
  width: number;
  height: number;
}> = async function createGroupMap(data) {
  const { app, socket } = this;
  const player = app.player.manager.findPlayer(socket);
  if (_.isNil(player)) {
    throw new Error('尚未登录');
  }

  const { groupUUID, name, width, height } = data;

  if (
    _.isNil(groupUUID) ||
    _.isNil(name) ||
    _.isNil(width) ||
    _.isNil(height)
  ) {
    throw new Error('缺少必要参数');
  }

  const newGameMap = await TRPGGameMap.createGroupMap(
    groupUUID,
    player.uuid,
    name,
    width,
    height
  );

  return { mapData: newGameMap };
};

/**
 * 加入地图房间
 * 并返回房间数据
 * 同时会通知房间所有成员更新地图连接列表
 */
export const joinMapRoom: EventFunc<{
  mapUUID: string;
  jwt?: string; // 可选。如果带了jwt则解析其是否绑定登录信息
}> = async function joinMapRoom(data, cb, db) {
  const app = this.app;
  const socket = this.socket;

  const { mapUUID, jwt } = data;
  if (_.isNil(mapUUID)) {
    throw new Error('缺少必要字段');
  }

  await app.trpg.mapManager.joinRoom(mapUUID, socket);
  if (_.isString(jwt)) {
    // 如果登录时带了jwt。则尝试解析并绑定信息
    try {
      const payload = await PlayerUser.verifyJWT(jwt);
      await app.trpg.mapManager.setSocketExtraInfo(socket, {
        uuid: payload.uuid,
        name: payload.name,
        avatar: payload.avatar,
      });
    } catch (e) {
      debug('[joinMapRoom] 设置绑定socket信息出现问题: %o', e);
    }
  }

  const mapData = await TRPGGameMap.getMapData(mapUUID);

  notifyUpdateOnlineSocketList(
    mapUUID
  );

  return { mapData };
};

/**
 * 更新棋子数据
 */
export const updateMapToken: EventFunc<{
  mapUUID: string;
  type: MapUpdateType;
  payload: any;
}> = async function updateMapToken(data, cb, db) {
  const { app, socket } = this;
  const { mapUUID, type, payload } = data;

  if (_.isNil(mapUUID) || _.isNil(type) || _.isEmpty(payload)) {
    throw new Error('缺少必要参数');
  }

  // 简单鉴权
  const jwt = _.get(payload, 'jwt');
  let playerUUID: string;
  try {
    const d = await app.jwtVerify(jwt);
    playerUUID = _.get(d, 'uuid');
  } catch (e) {
    throw new Error('鉴权失败, 请检查授权');
  }

  if (type === 'add') {
    const p = payload as UpdateTokenPayloadMap['add'];
    await TRPGGameMap.addToken(mapUUID, playerUUID, p.layerId, p.token);
  } else if (type === 'update') {
    const p = payload as UpdateTokenPayloadMap['update'];
    await TRPGGameMap.updateToken(
      mapUUID,
      playerUUID,
      p.layerId,
      p.tokenId,
      p.tokenAttrs
    );
  } else if (type === 'remove') {
    const p = payload as UpdateTokenPayloadMap['remove'];
    await TRPGGameMap.removeToken(mapUUID, playerUUID, p.layerId, p.tokenId);
  }

  return true;
};

export const updateMapLayer: EventFunc<{
  mapUUID: string;
  type: MapUpdateType;
  payload: {};
}> = async function updateMapLayer(data, cb, db) {
  // TODO
  return false;
};
