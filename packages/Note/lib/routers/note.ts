import { TRPGRouter } from 'trpg/core';
import { NoteNote } from '../models/note';
import { PlayerUser } from 'packages/Player/lib/models/user';

const noteRouter = new TRPGRouter();

noteRouter.get('/:noteUUID', async (ctx, next) => {
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

export default noteRouter;
