import Debug from 'debug';
import BasePackage from 'lib/package';
const debug = Debug('trpg:component:mail');
import nodemailer from 'nodemailer';
import * as event from './event';
import MailListDefinition from './models/list';
import MailRecordDefinition, { MailRecord } from './models/record';
import mailRouter from './routers/mail';
import * as utils from './utils';

export default class Mail extends BasePackage {
  public name: string = 'Mail';
  public require: string[] = ['Player'];
  public desc: string = '邮件模块';

  onInit() {
    this.initStorage();
    this.initFunction();
    this.initSocket();
    this.initRouters();
  }

  initStorage() {
    this.regModel(MailListDefinition);
    this.regModel(MailRecordDefinition);
  }

  initFunction() {
    const app = this.app;
    const aeskey = this.getConfig('mail.aeskey');
    const smtpConfig = this.getConfig('mail.smtp');

    debug(`mail aeskey(${aeskey.length}): ${aeskey}`);

    this.regMethods({
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
        } as any;

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
        await MailRecord.create(recordData);

        return recordData;
      },
      encryption(data: string) {
        return utils.encryption(data, aeskey);
      },
      decryption(data: string) {
        return utils.decryption(data, aeskey);
      },
    });
  }

  initSocket() {
    this.regSocketEvent('bindMail', event.bindMail);
  }

  initRouters() {
    this.regRoute(mailRouter);
  }
}

function sendMail(mailOptions) {
  const app = this;
  const smtpConfig = app.get('mail.smtp');

  return new Promise(function (resolve, reject) {
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
