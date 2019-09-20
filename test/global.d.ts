declare namespace NodeJS {
  interface Global {
    _: any;
    trpgapp: any;
    db: any;
    socket: any;
    port: string;
    testEvent<T = any>(eventFn: any, data?: any): Promise<T>;
    emitEvent<T = any>(eventName: string, data?: any): Promise<T>;
    generateRandomStr(length: number): string;
  }
}
