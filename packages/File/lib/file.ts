import Debug from 'debug';
const debug = Debug('trpg:component:file');
import fs from 'fs-extra';
import filesize from 'filesize';
import config from './config';
import { initFileService } from './webservice';
import { bindAttachUUID, getFileInfo } from './event';
import FileAvatarDefinition, { FileAvatar } from './models/avatar';
import FileChatimgDefinition from './models/chatimg';
import FileFileDefinition from './models/file';
import FileOSSDefinition from './models/oss';
import FileDocumentDefinition from './models/document';
import { TRPGApplication } from 'trpg/core';
import FileImageDefinition from './models/image';

function deleteAll(path: string) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      var curPath = path + '/' + file;
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        deleteAll(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

async function removeFileAsync(path) {
  let exists = await fs.pathExists(path);
  if (exists) {
    await fs.remove(path);
    debug('remove file:', path);
  }
}

function checkDir() {
  fs.ensureDir('public/uploads/temporary');
  fs.ensureDir('public/uploads/persistence');
  fs.ensureDir('public/avatar/thumbnail');
  fs.ensureDir('public/image');

  let chatimgDir = config.path.chatimgDir;
  debug('聊天图片文件夹路径:', chatimgDir);
  fs.ensureDir(chatimgDir);
}

module.exports = function FileComponent(app: TRPGApplication) {
  checkDir(); // 创建上传文件夹
  app.storage.registerModel(FileAvatarDefinition);
  app.storage.registerModel(FileChatimgDefinition);
  app.storage.registerModel(FileFileDefinition);
  app.storage.registerModel(FileImageDefinition);
  app.storage.registerModel(FileOSSDefinition);
  app.storage.registerModel(FileDocumentDefinition);

  app.on('initCompleted', function (app) {
    // 数据信息统计
    debug('storage has been load 3 file db model');
  });

  initFileService(app); // 初始化文件服务

  app.on('resetStorage', function () {
    deleteAll('./public/uploads');
    deleteAll('./public/avatar');
    checkDir();
    debug('file disk storage reset completed!');
  });

  app.registerEvent('file::bindAttachUUID', bindAttachUUID);
  app.registerEvent('file::getFileInfo', getFileInfo);

  const cleanAvatar = app.get('file.clean.avatar', false);
  const cleanTemporary = app.get('file.clean.avatar', true);

  // Timer
  // TODO: 这个逻辑在分布式系统里面可能会有问题
  app.registerTimer(async function clearTemporaryFile() {
    // 每4小时定时清理public/uploads/temporary文件夹
    const db = app.storage.db;
    const Op = app.storage.Op;
    try {
      // 清理avatar
      if (cleanAvatar === true) {
        debug('start clear no-attach file...');
        let ltdate = new Date(
          new Date().setTime(new Date().getTime() - 1000 * 60 * 60 * 1)
        ); // 只找一小时内没有绑定关联uuid的
        let list = await FileAvatar.findAll({
          where: {
            attach_uuid: null,
            createdAt: { [Op.lt]: ltdate },
          },
        });
        let count = list.length;
        for (let fi of list) {
          let filename = fi.name;

          let isExistOther = await FileAvatar.findOne({
            where: {
              name: filename,
              attach_uuid: { [Op.ne]: null },
            },
          });
          if (!isExistOther) {
            await removeFileAsync(`./public/avatar/${filename}`); // remove origin image
            await removeFileAsync(`./public/avatar/thumbnail/${filename}`); // remove thumbnail image
          } else {
            debug('exist other file relation, only remove record:', filename);
          }

          await fi.destroy();
        }
        debug(`remove ${count} avatar file record success!`);
      }

      // 清理uploads文件
      if (cleanTemporary === true) {
        debug('start clear uploads file');
        let ltdate_f = new Date(
          new Date().setTime(new Date().getTime() - 1000 * 60 * 60 * 24 * 7)
        ); // 创建时间超过7天
        let list_f = await db.models.file_file.findAll({
          where: {
            is_expired: false,
            createdAt: { [Op.lt]: ltdate_f },
          },
        });
        for (let fi of list_f) {
          fi.is_expired = true;
          await fi.save();
        }
        for (let fi of list_f) {
          let filename = fi.name;
          let size = fi.size;
          let isExistOther = await db.models.file_avatar.findOne({
            where: { name: filename },
          });
          if (!isExistOther) {
            debug(
              `start remove temporary file: ${filename}[${filesize(size)}]`
            );
            await removeFileAsync(`./public/uploads/temporary/${filename}`);
          }
        }
        debug(`clear temporary file success!`);
      }
    } catch (e) {
      console.error(e);
      app.error(e);
    }
  }, 1000 * 60 * 60 * 4);

  return {
    name: 'File',
    require: ['Player'],
  };
};
