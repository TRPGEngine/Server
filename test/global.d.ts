declare namespace NodeJS {
  interface Global {
    trpgapp: any;
    emitEvent<T = any>(eventName: string, data?: any): Promise<T>;
  }
}
