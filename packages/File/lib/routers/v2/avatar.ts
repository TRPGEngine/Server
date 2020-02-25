import { TRPGRouter } from 'trpg/core';
import { upload } from '../../middleware/v2/upload';
import { sha256 } from '../../middleware/v2/sha256';
import { storage, StorageFileState } from '../../middleware/v2/storage';
import { ImageInfoState, thumbnail } from '../../middleware/v2/thumbnail';
import auth from '../../middleware/auth';
import allowMIME from '../../middleware/allow-mime';
import { FileAvatar } from '../../models/avatar';
import _ from 'lodash';

const avatarV2Router = new TRPGRouter();

type AvatarV2RouterState = ImageInfoState & StorageFileState;

avatarV2Router.post(
  '/upload',
  auth(),
  upload('avatar'),
  allowMIME(['image/jpeg', 'image/png']),
  thumbnail(128, 128),
  sha256(),
  storage('avatar'),
  async (ctx) => {
    const trpgapp = ctx.trpgapp;
    const state = ctx.state as AvatarV2RouterState;
    const file = state.file;
    const imageInfo = state.imageInfo;

    if (_.isNil(file)) {
      throw new Error('处理头像失败: 没有发现文件');
    }

    const type = ctx.header['avatar-type'] || 'actor';
    const attach_uuid: string = ctx.header['attach-uuid'] || null;

    await trpgapp.storage.transaction('processAvatar', async () => {
      if (attach_uuid) {
        // attach_uuid应唯一:一个用户只能有一个对应的头像文件、一个角色只能有一个对应的图片
        // 没有attach_uuid的文件被视为可以删除
        await FileAvatar.update(
          {
            attach_uuid: null,
          },
          {
            where: { attach_uuid, type },
          }
        );
      }

      const avatar: FileAvatar = await FileAvatar.create({
        name: file.filename,
        size: file.size,
        type,
        attach_uuid,
        width: imageInfo.width,
        height: imageInfo.height,
        owner_uuid: ctx.player.user.uuid,
        ownerId: ctx.player.user.id,
      });

      ctx.body = { url: state.url, isLocal: state.isLocal, uuid: avatar.uuid };
    });
  }
);

export default avatarV2Router;
