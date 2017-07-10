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

  $('#login-form .register').click(function() {
    swal({
      title: "注册账号!",
      text: "请输入您的用户名:",
      type: "input",
      showCancelButton: true,
      closeOnConfirm: false,
      animation: "slide-from-top",
      inputPlaceholder: "在此输入您的用户名"
    },
    function(inputValue) {
      console.log(inputValue);
      if (inputValue === false) return false;

      if (inputValue === "") {
        swal.showInputError("You need to write something!");
        return false
      }

      swal("Nice!", "You wrote: " + inputValue, "success");
    });
  });
});
