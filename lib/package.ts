import { TRPGApplication, Model, ModelFn, SocketEventFn } from 'trpg/core';

export default abstract class BasePackage {
  public abstract name: string;
  public abstract require: string[];
  public desc: string;
  private _app: TRPGApplication;
  private _models: Model[]; // 该包注册的数据库模型列表

  constructor(app: TRPGApplication) {
    this._app = app;
  }

  get storage() {
    return this._app.storage;
  }

  regModel(modelFn: ModelFn) {
    const storage = this._app.storage;
    const model = storage.registerModel(modelFn);
    this._models.push(model);
  }

  regSocketEvent(name: string, event: SocketEventFn) {
    const app = this._app;
    const packageName = this.name;
    if (!name.startsWith(`${packageName}::`)) {
      // 事件名必须为: 包名::事件名
      name = `${packageName}::${name}`;
    }

    app.registerEvent(name, event);
  }

  regValue(value: {}) {}
  regMethod(method: any) {}
}
