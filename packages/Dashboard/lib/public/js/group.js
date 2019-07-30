layui.use(['layer', 'table'], function() { //独立版的layer无需执行这一句
  // var $ = layui.jquery;
  var layer = layui.layer; //独立版的layer无需执行这一句
  var table = layui.table;
  var reloadTable = function() {
    chatLogTable.reload();
    console.log("table reload");
  }

  var chatLogTable = table.render({
    elem: '#group-list',
    url:'/admin/api/group/_list',
    cellMinWidth: 80,
    cols: [[
      {field:'id', title: 'ID', sort: true, width: 80},
      {field:'uuid', title: 'UUID'},
      {field:'type', title: '类型'},
      {field:'name', title: '团名'},
      {field:'sub_name', title: '团副名'},
      {field:'desc', title: '简介'},
      {field:'avatar', title: '头像', align: 'center', templet: '#tableAvatarTpl', width: 70},
      {field:'creator_uuid', title: '创建人UUID'},
      {field:'owner_uuid', title: '拥有人UUID'},
      {field:'managers_uuid', title: '管理员列表'},
      {field:'maps_uuid', title: '地图列表'},
      {field:'createAt', title: '创建时间', minWidth: 180, sort: true, templet: '#tableDateTpl2'},
      {field:'updateAt', title: '更新时间', minWidth: 180, sort: true, templet: '#tableDateTpl2'},
    ]],
    page: true,
  });

  $('#group-table-reload').click(function() {
    layer.msg('刷新完毕');
    reloadTable && reloadTable();
  });
});
