/**
 * WIP
 * 这是一个实验性的功能， 用于在单机测试多实例的启动脚本
 */

const cluster = require('cluster');
const net = require('net');
const getPort = require('get-port');
const config = require('config');
require('ts-node').register();
require('tsconfig-paths').register();
const loadModules = require('./loader/standard');
const createTRPGApp = require('./packages/Core/');

const port = 23256;
const workerNum = require('os').cpus().length - 1;
// const workerNum = 1;

/**
 * IP Hash
 * 根据ip和长度生成一个 0-len 的数字
 * @param {string} ip ip地址
 * @param {number} len 总长度
 */
const ipHash = (ip, len) => {
  let s = '';
  for (let i = 0, _len = ip.length; i < _len; i++) {
    if (!isNaN(ip[i])) {
      s += ip[i];
    }
  }

  return Number(s) % len;
};

if (cluster.isMaster) {
  const workers = [];

  const spawn = function(i) {
    workers[i] = cluster.fork();
    workers[i].on('exit', function(code, signal) {
      // worker 退出后自动重启
      console.log('respawning worker', i);
      spawn(i);
    });
  };
  for (let i = 0; i < workerNum; i++) {
    console.log('start worker:', i);
    spawn(i);
  }

  const server = net
    .createServer({ pauseOnConnect: true }, function(connection) {
      // TODO: 在nginx里需要变更获取远程地址的方式
      const remoteAddress = connection.remoteAddress; // 连接远程地址
      const workerIndex = ipHash(remoteAddress, workerNum);
      const worker = workers[workerIndex];
      console.log('workerIndex:', workerIndex);
      worker.send('sticky-session:connection', connection);
    })
    .listen(port);
} else {
  // worker
  getPort({ port: getPort.makeRange(23260, 23360) }).then((port) => {
    // 启动TRPG应用实例
    const app = createTRPGApp(
      Object.assign({}, config, {
        port,
      })
    );

    loadModules(app);

    app.run();

    process.on('message', function(message, connection) {
      if (message !== 'sticky-session:connection') {
        return;
      }

      app.emit('connection', connection);

      connection.resume();
    });
  });
}
