import { TRPGRouter } from 'trpg/core';
import { upload } from '../../middleware/v2/upload';
import { sha256 } from '../../middleware/v2/sha256';
import { storage, StorageFileState } from '../../middleware/v2/storage';
import thumbnail from '../../middleware/v2/thumbnail';
import auth from '../../middleware/auth';
import allowMIME from '../../middleware/allow-mime';

const avatarV2Router = new TRPGRouter();

avatarV2Router.post(
  '/upload',
  auth(),
  upload('avatar'),
  allowMIME(['image/jpeg', 'image/png']),
  thumbnail(128, 128),
  sha256(),
  storage('avatar'),
  (ctx) => {
    const state = ctx.state as StorageFileState;

    // TODO: 存储记录到Avatar表并绑定UUID

    ctx.body = { url: state.url, isLocal: state.isLocal };
  }
);

export default avatarV2Router;
