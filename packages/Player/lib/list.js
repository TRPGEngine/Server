const debug = require('debug')('trpg:component:player:list');

module.exports = PlayerList;

function PlayerList() {
  if (!(this instanceof PlayerList)) return new PlayerList();

  this.list = [];
  return this;
}

PlayerList.prototype.find = function find(socket) {
  let result = null;
  for (player of this.list) {
    if(player.socket === socket) {
      result = player;
      break;
    }
  }

  return result;
}

PlayerList.prototype.get = function get(uuid) {
  let result = null;
  for (player of this.list) {
    if(player.uuid === uuid) {
      result = player;
      break;
    }
  }

  return result;
}

PlayerList.prototype.add = function add(user, socket) {
  let uuid = user.uuid;
  for (player of this.list) {
    if(player.uuid === uuid) {
      // TODO: 修改为允许多端登录。并自动清除已经断开的链接
      if(player.socket !== socket) {
        this.remove(uuid, true);
        break;
      }else {
        debug('player %s logined', uuid);
        return;
      }
    }
  }

  this.list.push({uuid, user, socket});
  debug('add success, current list have %d player', this.list.length);
}

PlayerList.prototype.remove = function remove(uuid, slient = false) {
  let list = this.list;
  for (var i = 0; i < list.length; i++) {
    let p = list[i];
    if(p.uuid === uuid) {
      if(slient === true) {
        try {
          if(p.socket && p.socket.connected) {
            p.socket.emit('player::tick', {msg: '你已在其他地方登陆'});
            p.socket.disconnect();
          }
        }catch(e) {
          console.error('tick player error:', e);
        }
      }

      list.splice(i, 1);

      debug('remove user(%s) success! current list have %d player', uuid, this.list.length);
      return true;
    }
  }

  return false;
}
