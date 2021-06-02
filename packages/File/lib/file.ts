import Debug from 'debug';
const debug = Debug('trpg:component:file');
import fs from 'fs-extra';
import filesize from 'filesize';
import config from './config';
import { initFileService } from './webservice';
import * as event from './event';
import FileAvatarDefinition, { FileAvatar } from './models/avatar';
import FileChatimgDefinition from './models/chatimg';
import FileFileDefinition from './models/file';
import FileOSSDefinition from './models/oss';
import FileDocumentDefinition from './models/document';
import { TRPGApplication } from 'trpg/core';
import FileImageDefinition from './models/image';
import BasePackage from 'lib/package';

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

export default class File extends BasePackage {
  public name: string = 'File';
  public require: string[] = ['Player'];
  public desc: string = '文件存储与管理模块';

  onInit(): void {
    checkDir(); // 创建上传文件夹

    this.initStorage();
    this.initRouters();
    this.initSocket();
  }

  initStorage() {
    this.regModel(FileAvatarDefinition);
    this.regModel(FileChatimgDefinition);
    this.regModel(FileFileDefinition);
    this.regModel(FileImageDefinition);
    this.regModel(FileOSSDefinition);
    this.regModel(FileDocumentDefinition);
  }

  initRouters() {
    initFileService(this.app); // 初始化文件服务
  }

  initSocket() {
    this.regSocketEvent('bindAttachUUID', event.bindAttachUUID);
    this.regSocketEvent('getFileInfo', event.getFileInfo);
  }
}

module.exports = function FileComponent(app: TRPGApplication) {
  return {
    name: 'File',
    require: ['Player'],
  };
};
