import { TRPGRouter } from 'trpg/core';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import _ from 'lodash';
import { NoteNoteVersion } from '../models/note-version';

const noteVersionRouter = new TRPGRouter<{
  player?: PlayerJWTPayload;
}>();

noteVersionRouter.post('/version/create', ssoAuth(), async (ctx, next) => {
  const playerUUID = ctx.state.player.uuid;
  const { noteUUID, comment } = ctx.request.body;

  if (_.isNil(noteUUID)) {
    throw new Error('缺少必要参数');
  }

  const version = await NoteNoteVersion.createNoteVersion(
    noteUUID,
    playerUUID,
    comment
  );

  ctx.body = { version };
});

export default noteVersionRouter;
