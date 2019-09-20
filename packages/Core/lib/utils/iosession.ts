import _ from 'lodash';
import Koa from 'koa';
import { Socket } from 'socket.io';

declare module 'socket.io' {
  interface Socket {
    iosession?: SessionContext;
    websession?: SessionContext;
  }
}

// Socket
export function IOSessionMiddleware(webapp: Koa, opt) {
  const store = opt.store;
  const key = opt.key || 'koa:sess';

  return async function(socket: Socket, next) {
    if (!socket.iosession) {
      socket.iosession = new SessionContext(`io:${socket.id}`, store);
    }

    if (!socket.websession) {
      if (socket.handshake.headers.cookie) {
        // 非严格指定，仅当有cookie的时候才会增加websession
        const ctx = webapp.createContext(
          socket.request,
          (socket as any).response
        );
        let sid = ctx.cookies.get(key, opt); // web的cookie对应的session id。如果只访问socket服务而没访问过web服务的话返回的是undefined

        socket.websession = new SessionContext(`web:${sid}`, store);
      }
    }

    return next();
  };
}

export function WebSessionMiddleware(webapp, opt) {
  const store = opt.store;
  const key = opt.key || 'koa:sess';

  return async function(ctx, next) {
    const socketId = ctx.cookies.get('io');
    if (!ctx.iosession && socketId) {
      // 创建iosession并将数据合并到session中
      ctx.iosession = new SessionContext(`io:${socketId}`, store);
      const iodata = await ctx.iosession.get();
      ctx.session = _.assign({}, ctx.session, iodata);
      await ctx.session.save();
    }
    return next();
  };
}

class SessionContext {
  sid: number;
  store: any;

  constructor(sid, store) {
    this.sid = sid;
    this.store = store;
  }

  // 如果path为空则返回所有
  async get(path) {
    const session = await this.store.get(this.sid);
    if (path && typeof path === 'string') {
      return _.get(session, path);
    }

    return session;
  }

  async set(path = '', value) {
    let session = await this.store.get(this.sid);
    if (!session) {
      session = {};
    }
    _.set(session, path, value);
    await this.store.set(this.sid, session);
    return session;
  }

  async destroy() {
    return this.store.destroy(this.sid);
  }
}
