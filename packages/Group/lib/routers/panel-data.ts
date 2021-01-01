import { TRPGRouter } from 'trpg/core';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import _ from 'lodash';
import { GroupPanelData } from '../models/panel-data';

const panelDataRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

panelDataRouter.get('/:groupUUID/panel/:panelUUID/data/get', async (ctx) => {
  const groupUUID = ctx.params.groupUUID;
  const panelUUID = ctx.params.panelUUID;

  const data = await GroupPanelData.getGroupPanelData(panelUUID);

  ctx.body = { data };
});
/**
 * 创建团列表的接口
 */
panelDataRouter.post(
  '/:groupUUID/panel/:panelUUID/data/set',
  ssoAuth(),
  async (ctx) => {
    const groupUUID = ctx.params.groupUUID;
    const panelUUID = ctx.params.panelUUID;
    const playerUUID = ctx.state.player.uuid;
    const { data } = ctx.request.body;

    if (_.isNil(data)) {
      throw new Error('缺少必要参数');
    }

    await GroupPanelData.setGroupPanelData(panelUUID, data, playerUUID);

    ctx.body = { result: true };
  }
);

export default panelDataRouter;
