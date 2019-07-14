layui.use('laytpl', function() {
  var laytpl = layui.laytpl;
  var tableTemplate = $('#table-template').html();
  var container = $('#system-info');

  var updateInfo = function() {
    $.get('/admin/api/system/_info', function(data) {
      if(data.result) {
        var info = data.info;
        laytpl(tableTemplate).render(info, function(html) {
          container.html(html);
        });
      }else {
        console.error(data);
      }

      setTimeout(updateInfo, 2000);
    })
  }

  updateInfo();
})
