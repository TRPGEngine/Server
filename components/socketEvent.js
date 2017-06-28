module.exports = {
  init: function(core) {
    core.addEventListener('core::getRoomInfo', function(data, fn) {
      let roomId = data.roomId;

      // demo
      fn({
        roomId,
        roomName: 'test',
        roomNum: 9,
        roomMaxNum: 10,
        roomPassword: true,
        roomOwner: 'admin'
      })
    });
  }
}
