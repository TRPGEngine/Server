import { TRPGApplication, Model, ModelFn, SocketEventFn } from 'trpg/core';
import Router from 'koa-router';
import Debug, { Debugger } from 'debug';

export default abstract class BasePackage {
  public abstract name: string;
  public abstract require: string[];
  public desc: string;
  private _debug: Debugger;
  private _app: TRPGApplication;
  private _models: Model[]; // 该包注册的数据库模型列表
  private _router: Router; // 该包独有的Router

  constructor(app: TRPGApplication) {
    this._app = app;

    this._debug = Debug(`trpg:package:${this.getPackageName()}`);
  }

  get app() {
    return this._app;
  }

  get storage() {
    return this.app.storage;
  }

  get router() {
    if (!this._router) {
      this._router = new Router();
    }
    return this._router;
  }

  getPackageName() {
    return this.name;
  }

  regModel(modelFn: ModelFn) {
    const storage = this.storage;
    const model = storage.registerModel(modelFn);
    this._models.push(model);
  }

  regSocketEvent(name: string, event: SocketEventFn) {
    const app = this.app;
    const packageName = this.name;
    if (!name.startsWith(`${packageName}::`)) {
      // 事件名必须为: 包名::事件名
      name = `${packageName}::${name}`;
    }

    app.registerEvent(name, event);
  }

  regRoute(path: string, route: Router) {
    this.router.use(path, route.routes());
  }

  initCompleted() {
    const app = this.app;

    if (this._router) {
      // 如果使用过router 则将该router注册到web服务中
      const webservice = app.webservice;
      webservice.use(this._router.routes());
    }

    this.debug(
      'Init package %s completed! [Required: %s, Model: %d]',
      this.getPackageName(),
      this.require,
      this._models.length
    );
  }

  regValue(value: {}) {}
  regMethod(method: any) {}

  debug(formatter: any, ...args: any[]) {
    this._debug(formatter, ...args);
  }
}
