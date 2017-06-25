$(function() {
  $('#login-btn').click(function() {
    var data = $('#login-form').serialize();

    $.post('/_login', data, function(data, textStatus, xhr) {
      console.log(data);
      if(data.result) {
        location.href = "/lobby";
      }
    });
  });
});
