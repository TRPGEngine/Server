$(function() {
  var wsurl = window.location.protocol + "//" + window.location.hostname + ":23256";
  var socket = io.connect(wsurl);

  socket.on('connect',function(){
    // 连接成功
    console.log('连接成功');

    socket.on('chat', function(msg) {
      console.log(msg);
    });
  });
  socket.on('disconnect',function(data){
    // 连接断开
    console.log('连接断开');
  });
})
