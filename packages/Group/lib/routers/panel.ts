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
 * 获取团面板中文字频道列表
 */
panelRouter.get(
  '/:groupUUID/panel/textChannel/list',
  ssoAuth(),
  async (ctx) => {
    const groupUUID = ctx.params.groupUUID;
    const playerUUID = ctx.state.player.uuid;

    const panels = await GroupPanel.getGroupPanelsByType(
      groupUUID,
      'channel',
      playerUUID
    );

    ctx.body = { panels };
  }
);

/**
 * 创建团列表的接口
 */
panelRouter.post('/:groupUUID/panel/create', ssoAuth(), async (ctx) => {
  const groupUUID = ctx.params.groupUUID;
  const playerUUID = ctx.state.player.uuid;
  const { name, type, extra } = ctx.request.body;

  if (_.isNil(groupUUID) || _.isNil(name) || _.isNil(type)) {
    throw new Error('缺少必要参数');
  }

  const { groupPanel, other } = await GroupPanel.createPanel(
    name,
    type,
    extra,
    groupUUID,
    playerUUID
  );

  ctx.body = { ...other, groupPanel };
});

panelRouter.post(
  '/:groupUUID/panel/:panelUUID/remove',
  ssoAuth(),
  async (ctx) => {
    const groupUUID = ctx.params.groupUUID;
    const panelUUID = ctx.params.panelUUID;
    const playerUUID = ctx.state.player.uuid;

    if (_.isNil(panelUUID)) {
      throw new Error('缺少必要参数');
    }

    await GroupPanel.removePanel(panelUUID, playerUUID);

    ctx.body = { result: true };
  }
);

panelRouter.post('/:groupUUID/panel/updateOrder', ssoAuth(), async (ctx) => {
  const groupUUID = ctx.params.groupUUID;
  const playerUUID = ctx.state.player.uuid;
  const { panelOrderList } = ctx.request.body;

  if (_.isNil(groupUUID) || _.isNil(panelOrderList)) {
    throw new Error('缺少必要参数');
  }

  await GroupPanel.updateGroupPanelOrder(groupUUID, playerUUID, panelOrderList);

  ctx.body = { result: true };
});

panelRouter.post('/:groupUUID/panel/updateInfo', ssoAuth(), async (ctx) => {
  const groupUUID = ctx.params.groupUUID;
  const playerUUID = ctx.state.player.uuid;
  const { panelUUID, info } = ctx.request.body;

  if (_.isNil(panelUUID) || _.isNil(info)) {
    throw new Error('缺少必要参数');
  }

  await GroupPanel.updatePanelInfo(panelUUID, playerUUID, info);

  ctx.body = { result: true };
});

export default panelRouter;
