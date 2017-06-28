$(function() {
  var wsurl = window.location.protocol + "//" + window.location.hostname + ":23256";
  var socket = io.connect(wsurl);
  var roomInfoTpl = Handlebars.compile($('#roomInfoTpl').html());

  socket.on('connect',function(){
    // 连接成功
    console.log('连接成功');

    socket.on('core::chat', function(msg) {
      console.log(msg);
    });
  });
  socket.on('disconnect',function(data){
    // 连接断开
    console.log('连接断开');
  });

  $('.room-list .room-item').click(function() {
    var roomId = $(this).data('roomId');
    socket.emit('core::getRoomInfo', {roomId: roomId}, function(data) {
      console.log('core::getRoomInfo', data);
      $('.roomInfo').html(roomInfoTpl(data)).animate({width: '400px'});
    })
  })
});
