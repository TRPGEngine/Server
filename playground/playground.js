const app = require('../standard.js');
const repl = require('repl');

const r = repl.start('trpg > ');

console.log(`
提供可访问对象:

- app
- db

简单操作符:

- p # 用法: p(Promise<any>) => void, 完成后打印结果

使用--experimental-repl-await来获得一个全局await的支持
`);

function setContext(key, value) {
  Object.defineProperty(r.context, key, {
    configurable: false,
    enumerable: true,
    value,
  });
}

setContext('app', app);
setContext('db', app.storage.db);
setContext('p', (promise) => {
  Promise.resolve(promise)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });
});
