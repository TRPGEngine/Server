var roomInfo = $.script.getData();

$(function() {
  var msgTpl = Handlebars.compile($('#msgTpl').html());

  var addMessage = function(msg, isReceived) {
    if(!isReceived) {
      isReceived = false;
    }

    $('.chat .message-log').append(msgTpl({
      content: msg,
      isReceived: isReceived
    })).animate({scrollTop: $(document).height()}, 300);
  }

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
