const _ = require('lodash');

function IOSessionMiddleware(webapp, opt) {
  const store = opt.store;
  const key = opt.key || 'koa:sess';

  return async function(socket, next) {
    if (!socket.handshake.headers.cookie) {
      return next(new Error('no cookie'));
    }
    if(socket.websession) {
      return next();
    }

    let ctx = webapp.createContext(socket.request, socket.response);
    let sid = ctx.cookies.get(key, opt); // web的cookie对应的session id。如果只访问socket服务而没访问过web服务的话返回的是undefined

    socket.iosession = new SessionContext(`io:${socket.id}`, store);
    socket.websession = new SessionContext(`web:${sid}`, store);

    return next()
  }
}

function WebSessionMiddleware(webapp, opt) {
  const store = opt.store;
  const key = opt.key || 'koa:sess';

  return async function(ctx, next) {
    const socketId = ctx.cookies.get('io');
    if(!ctx.iosession && socketId) {
      // 创建iosession并将数据合并到session中
      ctx.iosession = new SessionContext(`io:${socketId}`, store);
      const iodata = await ctx.iosession.get();
      ctx.session = _.assign({}, ctx.session, iodata);
      await ctx.session.save();
    }
    return next();
  }
}

module.exports = {
  IOSessionMiddleware,
  WebSessionMiddleware
};

function SessionContext(sid, store) {
  this.sid = sid;
  this.store = store;
}

// 如果path为空则返回所有
SessionContext.prototype.get = async function(path) {
  const session = await this.store.get(this.sid);
  if(path && typeof path === 'string') {
    return _.get(session, path)
  }

  return session;
}

SessionContext.prototype.set = async function(path = '', value) {
  let session = await this.store.get(this.sid);
  if(!session) {
    session = {};
  }
  _.set(session, path, value);
  await this.store.set(this.sid, session);
  return session;
}

SessionContext.prototype.destroy = function() {
  return this.store.destroy(this.sid);
}
