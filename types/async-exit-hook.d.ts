declare module 'async-exit-hook' {
  const exitHook: (callback: (cb?: () => void) => void) => void;

  export = exitHook;
}
