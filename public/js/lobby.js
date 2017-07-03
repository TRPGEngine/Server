$(function() {
  var wsurl = window.location.protocol + "//" + window.location.hostname + ":23256";
  var socket = io.connect(wsurl);
  var roomInfoTpl = Handlebars.compile($('#roomInfoTpl').html());
  var user;

  socket.on('connect',function(){
    // 连接成功
    console.log('连接成功');

    // 获取人物列表
    $.getJSON('/player/actor/_list', function(data) {
      if(!data.result) {
        return;
      }

      user = data.user;
    });


    socket.on('core::chat', function(msg) {
      console.log(msg);
    });
  });
  socket.on('disconnect',function(data){
    // 连接断开
    console.log('连接断开');
  });

  // 房间列表点击获取房间信息
  $('.room-list .room-item').click(function() {
    var roomId = $(this).data('roomId');
    socket.emit('core::getRoomInfo', {roomId: roomId}, function(data) {
      console.log('core::getRoomInfo', data);
      $('.roomInfo').html(roomInfoTpl(data)).animate({width: '400px'});
    })
  });
  // 房间信息刷新按钮
  $('.roomInfo').on('click', 'i.fa-refresh', function() {
    var roomId = $(this).closest('.roomInfo>div').data('roomId')
    socket.emit('core::getRoomInfo', {roomId: roomId}, function(data) {
      console.log('core::getRoomInfo', data);
      $('.roomInfo').html(roomInfoTpl(data));
    })
  });
});
