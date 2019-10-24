import _ from 'lodash';
import { NotifyUPush } from 'packages/Notify/lib/models/upush';
import { TRPGRouter } from 'trpg/core';

const router = new TRPGRouter();

router.post('/send', async (ctx, next) => {
  const data = _.get(ctx, 'request.body');
  const { registrationId, title, content } = data;

  const trpgapp = ctx.trpgapp;
  const device: NotifyUPush = await NotifyUPush.findOne({
    where: {
      registration_id: registrationId,
    },
  });

  const msgId = await device.sendNotifyMsg(trpgapp, content, title);

  ctx.body = {
    result: true,
    msgId,
  };
});

module.exports = router;
