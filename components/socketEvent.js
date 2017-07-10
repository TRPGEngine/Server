const Player =

module.exports = {
  init: function(core) {
    core.addEventListener('core::setInfo', function(data, info) {
      console.log('set info', data);
    });

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
      });
    });

    core.addEventListener('core::joinRoom', function(data, fn) {
      let socket = this;
      let roomName = 'room_' + data.roomId;
      socket.join(roomName);
      socket.broadcast.to(roomName).emit('core::joinRoom', {name:'demo'});// TODO
      fn({roomName});
    });

    core.addEventListener('core::joinGroup', function(data, fn) {
      let socket = this;
      let groupName = 'group_' + data.roomId;
      socket.join(groupName);
      socket.broadcast.to(groupName).emit('core::joinGroup', {name:'demo'});// TODO
      fn({groupName});
    });
  }
}
