module.exports = {
  auth: async (ctx, next) => {
    if(ctx.request.ip.indexOf("127.0.0.1") >= 0 || !!ctx.session.tempAuth) {
      await next();
    }else {
      // ctx.body = {
      //   result: false,
      //   msg: 'No Access Permission'
      // }
      ctx.redirect('/admin/login');
    }
  },
  authAjax: async (ctx, next) => {
    if(ctx.request.ip.indexOf("127.0.0.1") >= 0 || !!ctx.session.tempAuth) {
      await next();
    }else {
      ctx.body = {
        result: false,
        msg: 'No Access Permission'
      }
    }
  },
}
