const debug = require('debug')('trpg:component:file');
const fs = require('fs-extra');
// const sh = require('./sample-http');
const event = require('./event');
const config = require('./config');
const filesize = require('filesize');

function deleteall(path) {
  var files = [];
  if(fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file, index) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteall(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

async function removeFileAsync(path) {
  let exists = await fs.pathExists(path);
  if(exists) {
    await fs.remove(path);
    debug('remove file:', path);
  }
}

function checkDir() {
  const autoMkdir = (path) => {
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }

  autoMkdir('public');
  autoMkdir('public/uploads');
  autoMkdir('public/uploads/temporary');
  autoMkdir('public/uploads/persistence');
  autoMkdir('public/avatar');
  autoMkdir('public/avatar/thumbnail');

  let chatimgDir = config.path.chatimgDir;
  debug('聊天图片文件夹路径:', chatimgDir);
  autoMkdir(chatimgDir);
}

module.exports = function (isStandalone = false) {
  return function FileComponent(app) {
    let httpserver;

    checkDir();// 创建上传文件夹
    app.storage.registerModel(require('./models/avatar.js'));
    app.storage.registerModel(require('./models/chatimg.js'));
    app.storage.registerModel(require('./models/file.js'));
    app.on('initCompleted', function(app) {
      // 数据信息统计
      debug('storage has been load 3 file db model');
    });

    if(isStandalone === true) {
      httpserver = require('./koa')(app, 23257);
    }else {
      require('./webservice')(app);
    }

    app.on('resetStorage', function() {
      deleteall("./public/uploads");
      deleteall("./public/avatar");
      checkDir();
      debug('file disk storage reset completed!');
    })

    app.on('close', function() {
      httpserver && httpserver.destroy();
      console.log("file server closed!");
    })

    app.registerEvent('file::bindAttachUUID', event.bindAttachUUID);
    app.registerEvent('file::getFileInfo', event.getFileInfo);

    // Timer
    app.registerTimer(async function clearTemporaryFile() {
      // 每4小时定时清理public/uploads/temporary文件夹
      const db = app.storage.db;
      const Op = app.storage.Op;
      try {
        // 清理avatar
        debug("start clear no-attach file...");
        let ltdate = new Date(new Date().setTime(new Date().getTime() - 1000 * 60 * 60 * 1));// 只找一小时内没有绑定关联uuid的
        let list = await db.models.file_avatar.findAll({where: {
          attach_uuid: null,
          createdAt: {[Op.lt]: ltdate}
        }});
        let count = list.length;
        for (let fi of list) {
          let filename = fi.name;

          let isExistOther = await db.models.file_avatar.findOne({
            where: {
              name: filename,
              attach_uuid: {[Op.ne]: null}
            }
          });
          if(!isExistOther) {
            await removeFileAsync(`./public/avatar/${filename}`);// remove origin image
            await removeFileAsync(`./public/avatar/thumbnail/${filename}`);// remove thumbnail image
          }else {
            debug('exist other file relation, only remove record:', filename);
          }

          await fi.removeAsync();
        }
        debug(`remove ${count} avatar file record success!`);

        // 清理uploads文件
        let ltdate_f = new Date(new Date().setTime(new Date().getTime() - 1000 * 60 * 60 * 24 * 7));// 创建时间超过7天
        let list_f = await db.models.file_file.findAll({
          where: {
            is_expired: false,
            createdAt: {[Op.lt]: ltdate_f}
          }
        });
        for(let fi of list_f) {
          fi.is_expired = true;
          await fi.saveAsync();
        }
        for(let fi of list_f) {
          let filename = fi.name;
          let size = fi.size;
          let isExistOther = await db.models.file_avatar.findOne({
            where: {name: filename}
          });
          if(!isExistOther) {
            debug(`start remove temporary file: ${filename}[${filesize(size)}]`);
            await removeFileAsync(`./public/uploads/temporary/${filename}`);
          }
        }
        debug(`clear temporary file success!`);
      }catch(e) {
        console.error(e);
        app.error(e);
      }
    }, 1000 * 60 * 60 * 4);

    return {
      name: 'FileComponent',
      require: ['PlayerComponent']
    }
  }
}
