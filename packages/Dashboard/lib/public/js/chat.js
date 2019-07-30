layui.use(['layer', 'table', 'form'], function() { //独立版的layer无需执行这一句
  // var $ = layui.jquery;
  var layer = layui.layer; //独立版的layer无需执行这一句
  var table = layui.table;
  var form = layui.form;
  var reloadTable = function() {
    chatLogTable.reload();
    console.log("table reload");
  }

  $('#sync-log-btn, #sync-log-btn2').click(function() {
    $.post('/admin/api/chat/_save', function(data) {
      if(data.result) {
        layer.open({
          type: 1,
          offset: 'auto',
          id: 'syncLogLayer',
          content: '<div style="padding: 20px 100px;">聊天信息同步成功</div>',
          btn: '确定',
          btnAlign: 'c',
          shade: 0,
          yes: function() {
            layer.closeAll();
          }
        });
        reloadTable && reloadTable();
      }else {
        console.error(data);
        layer.msg('同步失败, 请检查后台');
      }
    }).error(function(xhr) {
      console.log('错误信息:', xhr.responseJSON);
      layer.msg('同步失败, 请检查后台');
    })
  })

  var chatLogTable = table.render({
    elem: '#chat-log',
    url:'/admin/api/chat/_log',
    cellMinWidth: 80,
    cols: [[
      {field:'id', title: 'ID', sort: true, width: 80},
      {field:'uuid', title: '信息UUID'},
      {field:'sender_uuid', title: '发送方UUID'},
      {field:'to_uuid', title: '接受方UUID'},
      {field:'converse_uuid', title: '会话UUID'},
      {field:'message', title: '信息内容', minWidth: 150},
      {field:'type', title: '信息类型', sort: true},
      {field:'data', title: '附带数据', templet: '#tableDataTpl'},
      {field:'is_public', title: '是否公开', sort: true},
      {field:'is_group', title: '是否团', sort: true},
      {field:'date', title: '日期', sort: true, templet: '#tableDateTpl'}
    ]],
    page: true,
  });

  $('#chat-table-reload').click(function() {
    layer.msg('刷新完毕');
    reloadTable && reloadTable();
  });

  // 发送系统信息
  form.on('submit(sendSystemMsg)', function(data){
    var form = $(data.form);
    $.post('/admin/api/chat/_sendSystemMsg', {
      to_uuid: data.field.uuid,
      type: data.field.type,
      title: data.field.title,
      content: data.field.content,
    }, function(data) {
      if(data.result) {
        layer.msg('发送成功');
        form.find('[name="title"]').val('');
        form.find('[name="content"]').val('');
      }else {
        layer.msg(data.msg);
      }
    })

    return false;
  });
});
