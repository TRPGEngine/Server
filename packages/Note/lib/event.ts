import { filterXSS } from 'xss';
import Debug from 'debug';
import { EventFunc } from 'trpg/core';
import { NoteNote } from './models/note';
import { PlayerUser } from 'packages/Player/lib/models/user';
const debug = Debug('trpg:component:note:event');

/**
 * 获取笔记内容
 */
export const get: EventFunc<{
  noteUUID: string;
}> = async function get(data, cb, db) {
  const { app, socket } = this;

  if (!app.player) {
    debug('[GroupComponent] need [PlayerComponent]');
    return;
  }

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const { noteUUID } = data;
  if (!noteUUID) {
    throw new Error('缺少参数');
  }

  const note: NoteNote = await NoteNote.findOne({ where: { uuid: noteUUID } });
  if (!note) {
    throw new Error('该笔记不存在');
  }

  return {
    note: {
      ...note,
      summary: note.getSummary(),
      cover: note.getCoverImage(),
    },
  };
};

/**
 * 旧版保存逻辑 弃用
 */
export const save: EventFunc<{
  noteUUID: string;
  noteTitle: string;
  noteContent: string;
}> = async function save(data, cb, db) {
  const { app, socket } = this;

  if (!app.player) {
    debug('[GroupComponent] need [PlayerComponent]');
    return;
  }

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  let { noteUUID, noteTitle, noteContent } = data;
  if (!noteUUID || !noteTitle) {
    throw new Error('缺少参数');
  }

  noteContent = filterXSS(noteContent); // 进行防xss处理

  const { id } = await PlayerUser.findOne({
    where: { uuid: player.uuid },
  });
  let note = await NoteNote.findOne({
    where: {
      uuid: noteUUID,
      ownerId: id,
    },
  });
  if (note) {
    // 之前已存在， 更新内容
    note.title = noteTitle;
    note.content = noteContent;
    await note.save();
  } else {
    note = await NoteNote.create({
      uuid: noteUUID,
      title: noteTitle,
      content: noteContent,
      ownerId: id,
    });
  }

  return { note };
};

/**
 * 获取用户的所有笔记
 */
export const getUserNotes: EventFunc = async function () {
  const { app, socket } = this;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const notes = await NoteNote.getUserNotes(player.uuid);

  return { notes };
};

/**
 * 新版创建笔记
 * 是没有参数版本的保存笔记
 */
export const createNote: EventFunc = async function () {
  const { app, socket } = this;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const note = await NoteNote.createNote(player.uuid);

  return { note };
};

/**
 * 新版保存笔记
 */
export const saveNote: EventFunc<{
  uuid: string;
  title: string;
  data: object;
}> = async function (eventData) {
  const { app, socket } = this;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const { uuid, title, data: noteData } = eventData;

  const note = await NoteNote.saveNote(uuid, title, noteData, player.uuid);

  return { note };
};

/**
 * 删除笔记
 */
export const deleteNote: EventFunc<{
  uuid: string;
}> = async function (eventData) {
  const { app, socket } = this;

  const player = app.player.manager.findPlayer(socket);
  if (!player) {
    throw new Error('用户不存在，请检查登录状态');
  }

  const { uuid } = eventData;

  await NoteNote.deleteNote(uuid, player.uuid);

  return true;
};
