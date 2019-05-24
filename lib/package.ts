import { TRPGApplication } from 'trpg/core';

export default abstract class BasePackage {
  public abstract name: string;
  public abstract require: string[];
  public desc: string;
  private _app: TRPGApplication;

  constructor(app: TRPGApplication) {
    this._app = app;
  }

  get storage() {
    return this._app.storage;
  }

  regDBModel(model) {
    // TODO
  }

  regSocketEvent(event) {}

  regValue(value: {}) {}
  regMethod(method: any) {}
}
