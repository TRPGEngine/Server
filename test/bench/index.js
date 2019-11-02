const fs = require('fs');
const path = require('path');
// NOTE: 弃用websocket-bench 使用别的测试组件来测试。因为该组件过久没有维护导致危险组件很多
const Benchmark = require('websocket-bench/lib/benchmark');
const DefaultReporter = require('websocket-bench/lib/defaultreporter.js');
const config = require('./config');

const outputStream = fs.createWriteStream(path.resolve(__dirname, './out.log'));
const reporter = new DefaultReporter(outputStream);

const bench = new Benchmark(config.server, reporter, config.options);

// On ctrl+c
process.on('SIGINT', function() {
  logger.info('\nGracefully stoping worker from SIGINT (Ctrl+C)');

  setTimeout(function() {
    if (bench.monitor.isRunning()) {
      bench.terminate();
    }
  }, 2000);
});

bench.launch(config.amount, config.concurency, config.worker, config.message);
