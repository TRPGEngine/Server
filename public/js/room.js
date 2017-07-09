var roomInfo = $.script.getData();

$(function() {
  var msgTpl = Handlebars.compile($('#msgTpl').html());
  var wsurl = window.location.protocol + "//" + window.location.hostname + ":23256";
  var socket = io.connect(wsurl);
  var addMessage = function(msg, isReceived) {
    if(!isReceived) {
      isReceived = false;
    }

    $('.chat .message-log').append(msgTpl({
      content: msg,
      isReceived: isReceived
    })).animate({scrollTop: $(document).height()}, 300);
  }

  socket.on('connect',function(){
    // 连接成功
    console.log('连接成功');

    socket.emit('core::joinRoom', {roomId:roomInfo.roomId}, function(roomName) {
      console.log('加入房间成功' + roomName);
    });

    socket.on('core::chat', function(msg) {
      addMessage(msg, true);
    });

    socket.on('core::joinRoom', function(data) {
      console.log("一名玩家进入房间", data);
    })
  });
  socket.on('connect_failed', function(data) {
    console.error('connect_failed', data);
    swal("连接服务器失败", "网络连接出现异常：" + data, "error");
  });
  socket.on('error', function(data) {
    console.error('error', data);
    swal("异常", "网络连接出现异常：" + data, "error");
  });
  socket.on('disconnect', function (data) {
    console.error('disconnect', data);
    swal("断开连接", "请检查您的网络", "error");
  });

  $('.chat .send-btn').click(function(event) {
    var msg = $('#msg-input').val();
    if(msg) {
      $('#msg-input').val('').focus();

      console.log(msg);
      addMessage(msg);
    }else {
      $('#msg-input').focus();
    }
  });
})
