import { TRPGRouter } from 'trpg/core';
import { GroupGroup } from '../models/group';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import _ from 'lodash';
import { GroupPanel } from '../models/panel';

const panelRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

/**
 * 创建团列表的接口
 */
panelRouter.post('/:groupUUID/panel/create', ssoAuth(), async (ctx) => {
  const groupUUID = ctx.params.groupUUID;
  const playerUUID = ctx.state.player.uuid;
  const { name, type } = ctx.request.body;

  if (_.isNil(groupUUID) || _.isNil(name) || _.isNil(type)) {
    throw new Error('缺少必要参数');
  }

  const { groupPanel, other } = await GroupPanel.createPanel(
    name,
    type,
    groupUUID,
    playerUUID
  );

  ctx.body = { ...other, groupPanel };
});

panelRouter.post('/:groupUUID/panel/updateOrder', ssoAuth(), async (ctx) => {
  const groupUUID = ctx.params.groupUUID;
  const playerUUID = ctx.state.player.uuid;
  const { groupOrderList } = ctx.request.body;

  if (_.isNil(groupUUID) || _.isNil(groupOrderList)) {
    throw new Error('缺少必要参数');
  }

  await GroupPanel.updateGroupPanelOrder(groupUUID, playerUUID, groupOrderList);

  ctx.body = { result: true };
});

export default panelRouter;
