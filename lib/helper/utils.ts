// JavaScript 中的 sleep 函数
// 参考 https://github.com/sqren/await-sleep/blob/master/index.js
export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export function isTestEnv(): boolean {
  return ['test', 'ci'].includes(process.env.NODE_ENV);
}
