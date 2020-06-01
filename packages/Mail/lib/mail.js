const debug = require('debug')('trpg:component:mail');
const nodemailer = require('nodemailer');
const Router = require('koa-router');
const router = new Router();
const event = require('./event');
const utils = require('./utils');

module.exports = function MailComponent(app) {
  initStorage.call(app);
  initFunction.call(app);
  initSocket.call(app);
  initRouters.call(app);

  return {
    name: 'MailComponent',
    require: ['PlayerComponent'],
  };
};

function initStorage() {
  let app = this;
  let storage = app.storage;
  storage.registerModel(require('./models/list.js'));
  storage.registerModel(require('./models/record.js'));

  app.on('initCompleted', function(app) {
    // 数据信息统计
    debug('storage has been load 2 mail db model');
  });
}

function initFunction() {
  const app = this;
  const aeskey = app.get('mail.aeskey');
  const smtpConfig = app.get('mail.smtp');

  debug(`mail aeskey(${aeskey.length}): ${aeskey}`);
  app.mail = {
    async sendAsync(userUUID, from, to, subject, html) {
      // 发送邮件
      if (!userUUID || !from || !to || !subject || !html) {
        throw new Error('邮件发送错误, 缺少参数');
      }

      let mailOptions = {
        from,
        to,
        subject,
        html,
      };

      let recordData = {
        user_uuid: userUUID,
        from,
        to,
        subject,
        body: html,
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
      };

      // 发送邮件
      try {
        let info = await sendMail.call(app, mailOptions);
        recordData.is_success = true;
        recordData.data = info;
      } catch (e) {
        recordData.is_success = false;
        recordData.error = e.toString();
      }

      // 存储记录
      const db = app.storage.db;
      await db.models.mail_record.createAsync(recordData);

      return recordData;
    },
    encryption(data) {
      return utils.encryption(data, aeskey);
    },
    decryption(data) {
      return utils.decryption(data, aeskey);
    },
  };
}

function initSocket() {
  let app = this;
  app.registerEvent('mail::bindMail', event.bindMail);
}

function initRouters() {
  const app = this;
  const webservice = app.webservice;
  const router = new Router();

  const mail = require('./routers/mail');

  router.use('/mail', mail.routes());
  webservice.use(router.routes());
}

function sendMail(mailOptions) {
  const app = this;
  const smtpConfig = app.get('mail.smtp');

  return new Promise(function(resolve, reject) {
    let transporter = nodemailer.createTransport(smtpConfig);
    debug('sendMail:', mailOptions);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        debug('sendMailError:', error);
        reject(error);
      } else {
        debug('sendMailSuccess:', info);
        resolve(info);
      }
    });
  });
}
