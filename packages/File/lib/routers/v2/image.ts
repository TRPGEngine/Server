import { ssoAuth } from 'packages/Player/lib/middleware/auth';
import { TRPGRouter } from 'trpg/core';
import { allowMIME } from '../../middleware/v2/allow-mime';
import { storage, StorageFileState } from '../../middleware/v2/storage';
import { upload } from '../../middleware/v2/upload';
import _ from 'lodash';
import { FileImage } from '../../models/image';
import { PlayerJWTPayload } from 'packages/Player/types/player';
import { PlayerUser } from 'packages/Player/lib/models/user';
import { sha256 } from '../../middleware/v2/sha256';
import { imageInfo, ImageInfoState } from '../../middleware/v2/image-info';

/**
 * 图片上传接口
 */

const imageV2Router = new TRPGRouter<
  { player: PlayerJWTPayload } & ImageInfoState & StorageFileState
>();

imageV2Router.post(
  '/upload',
  ssoAuth(),
  upload('image'),
  allowMIME(['image/jpeg', 'image/png']),
  sha256(),
  imageInfo(),
  storage('image'),
  async (ctx) => {
    const state = ctx.state;
    const file = state.file;
    const playerUUID = state.player.uuid;
    const imageInfo = state.imageInfo;

    if (_.isNil(file)) {
      throw new Error('处理图片失败: 没有发现文件');
    }

    const usage = ctx.header['usage'] ?? '';
    const attach_uuid: string = (ctx.header['attach-uuid'] as string) ?? null;

    const user = await PlayerUser.findByUUID(playerUUID);
    const image: FileImage = await FileImage.create({
      name: file.filename,
      size: file.size,
      width: imageInfo.width,
      height: imageInfo.height,
      usage,
      attach_uuid,
      owner_uuid: user.uuid,
      ownerId: user.id,
    });

    ctx.body = { url: state.url, isLocal: state.isLocal, uuid: image.uuid };
  }
);

export default imageV2Router;
