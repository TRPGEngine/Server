const Router = require('koa-router');
const router = new Router();

router.get('/validate/_bind', async (ctx, next) => {
  const template = require('../views/bind-result');
  const trpgapp = ctx.trpgapp;

  let { user_uuid, hash, email_address } = ctx.query;

  let mailInfo = JSON.parse(trpgapp.mail.decryption(hash));
  ctx.body = {
    user_uuid,
    email_address,
    hash,
    mailInfo,
  };

  if (
    mailInfo.user_uuid !== user_uuid ||
    mailInfo.email_address !== email_address
  ) {
    // 校验失败
    ctx.render(template, {
      result: false,
      errorMsg: '校验失败',
    });
    return;
  }

  if (mailInfo.enabled) {
    // 已绑定
    ctx.render(template, {
      result: false,
      errorMsg: '已绑定该邮箱',
    });
    return;
  }

  if (new Date().getTime() - mailInfo.timestamp > 10 * 60 * 1000) {
    // 已失效, 有效期十分钟
    ctx.render(template, {
      result: false,
      errorMsg: '该链接已过期，请重新发送',
    });
    return;
  }

  let db = ctx.trpgapp.storage.db;

  try {
    let mailbox = await db.models.mail_list.findByPk(mailInfo.id);
    let user = await db.models.player_user.findOne({
      where: {
        uuid: mailInfo.user_uuid,
      },
    });
    if (mailbox && user) {
      if (mailbox.enabled) {
        ctx.render(template, {
          result: false,
          errorMsg: '已绑定该邮箱, 请不要重复操作',
        });
      } else {
        mailbox.enabled = true;
        await mailbox.save();
        ctx.render(template, {
          result: true,
          email: mailbox.email_address,
          user,
        });
      }
    } else {
      ctx.render(template, {
        result: false,
        errorMsg: '找不到相关信息',
      });
      ctx.status = 404;
    }
  } catch (e) {
    console.error(e);
    ctx.render(template, {
      result: false,
      errorMsg: e.toString(),
    });
    ctx.status = 500;
  }
});

module.exports = router;
