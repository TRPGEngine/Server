const debug = require('debug')('trpg:component:note:event');
const xss = require("xss");

exports.get = async function get(data, cb, db) {
  let {app, socket} = this;

  if(!app.player) {
    debug('[GroupComponent] need [PlayerComponent]');
    return;
  }
  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let {noteUUID} = data;
  if(!noteUUID) {
    throw '缺少参数';
  }

  let note = await db.models.note_note.oneAsync({uuid: noteUUID});
  if(!note) {
    throw '该笔记不存在';
  }

  return {
    note: Object.assign({}, note, {
      summary: note.getSummary(),
      cover: note.getCoverImage(),
    })
  };
}

exports.save = async function save(data, cb, db) {
  let {app, socket} = this;

  if(!app.player) {
    debug('[GroupComponent] need [PlayerComponent]');
    return;
  }
  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }

  let {noteUUID, noteTitle, noteContent} = data;
  if(!noteUUID || !noteTitle) {
    throw '缺少参数';
  }

  noteContent = xss(noteContent);// 进行防xss处理

  let note = await db.models.note_note.oneAsync({uuid: noteUUID, ownerId: player.user.id});
  if(note) {
    // 之前已存在， 更新内容
    note.title = noteTitle;
    note.content = noteContent;
    await note.saveAsync();
  }else {
    note = await db.models.note_note.createAsync({
      uuid: noteUUID,
      title: noteTitle,
      content: noteContent,
      ownerId: player.user.id,
    });
  }

  return { note };
}
