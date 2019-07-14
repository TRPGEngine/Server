layui.use(['layer', 'table'], function() { //独立版的layer无需执行这一句
  // var $ = layui.jquery;
  var layer = layui.layer; //独立版的layer无需执行这一句
  var table = layui.table;
  var reloadTable = function() {
    chatLogTable.reload();
    console.log("table reload");
  }

  var chatLogTable = table.render({
    elem: '#player-list',
    url:'/admin/api/player/_list',
    cellMinWidth: 80,
    cols: [[
      {field:'id', title: 'ID', sort: true, width: 80},
      {field:'username', title: '用户名'},
      {field:'nickname', title: '昵称'},
      {field:'avatar', title: '头像', align: 'center', templet: '#tableAvatarTpl', width: 70},
      {field:'uuid', title: 'UUID'},
      {field:'last_login', title: '最近登录时间', minWidth: 150, sort: true, templet: '#tableDateTpl1'},
      {field:'last_ip', title: '最近登录IP', minWidth: 120},
      {field:'sex', title: '性别', sort: true},
      {field:'sign', title: '签名'},
      {field:'createAt', title: '注册时间', minWidth: 180, sort: true, templet: '#tableDateTpl2'},
    ]],
    page: true,
  });

  $('#player-table-reload').click(function() {
    layer.msg('刷新完毕');
    reloadTable && reloadTable();
  });
});
