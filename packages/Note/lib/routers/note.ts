import { TRPGRouter } from 'trpg/core';
import { NoteNote } from '../models/note';
import { PlayerUser } from 'packages/Player/lib/models/user';

const noteRouter = new TRPGRouter();

/**
 * 获取笔记静态页面
 */
noteRouter.get('/:noteUUID', async (ctx) => {
  const noteTemplate = require('../views/note');
  const notFoundTemplate = require('../views/404');

  const noteUUID = ctx.params.noteUUID;

  const note = await NoteNote.findOne({
    where: { uuid: noteUUID },
  });
  if (note) {
    const user = await PlayerUser.findByPk(note.ownerId);
    const pkg = {
      author: user,
      note: note,
    };
    ctx.render(noteTemplate, pkg);
  } else {
    ctx.render(notFoundTemplate);
    ctx.status = 404;
  }
});

/**
 * 获取笔记信息
 */
noteRouter.get('/:noteUUID/info', async (ctx) => {
  const noteUUID = ctx.params.noteUUID;

  const note = await NoteNote.findByUUID(noteUUID);

  ctx.body = {
    note,
  };
});

export default noteRouter;
