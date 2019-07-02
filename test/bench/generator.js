module.exports = {
  // 必选，建立连接后要做的事情
  onConnect: function(client, done) {
    // 向服务器发送消息
    // client为客户端的连接实例
    client.emit('hello', { time: new Date().valueOf() }, () => {
      done();
    });
    // 回调函数
    // done();
  },
  // 必选，向服务器发送消息时运行的代码
  sendMessage: function(client, done) {
    client.emit('message', new Date().valueOf(), () => {
      done();
    });
  },

  options: {
    // realm: 'chat'
  },
};
