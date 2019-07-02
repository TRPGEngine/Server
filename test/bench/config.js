const path = require('path');

module.exports = {
  server: 'http://localhost:23256',
  amount: 100, // Total number of persistent connection
  concurency: 20, // Concurent connection per second
  worker: 2, // number of worker
  message: 0, // number of message for a client
  options: {
    generatorFile: path.resolve(__dirname, './generator'),
    type: 'socket.io',
    transport: 'socket.io',
    keepAlive: false,
    verbose: false,
  },
};
