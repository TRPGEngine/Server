import { Model, Orm, DBInstance } from 'trpg/core';
import nodemailer, { Transporter } from 'nodemailer';
import Debug from 'debug';
import Mail from 'nodemailer/lib/mailer';
import { getLoggerWithTags } from 'packages/Core/lib/logger';
const debug = Debug('trpg:component:mail:record');
const logger = getLoggerWithTags(['mail']);

export class MailRecord extends Model {
  user_uuid: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  host: string;
  port: string;
  secure: boolean;
  is_success: boolean;
  data: any;
  error: string;

  /**
   * 创建邮件发送实例
   */
  static createMailerTransporter(): Transporter {
    const app = this.getApplication();
    const smtpConfig = app.get('mail.smtp');
    const transporter = nodemailer.createTransport(smtpConfig);

    return transporter;
  }

  /**
   * 检查邮件服务是否可用
   */
  static async verifyMailService(): Promise<boolean> {
    try {
      const transporter = MailRecord.createMailerTransporter();

      const verify = await transporter.verify();
      return verify;
    } catch (e) {
      this.getApplication().error(e);
      return false;
    }
  }

  /**
   * 发送邮件
   */
  static async sendMail(mailOptions: Mail.Options) {
    debug('sendMail:', mailOptions);
    const app = this.getApplication();
    const fromMailName = app.get('mail.senderName');
    const fromMailAddress = app.get('mail.smtp.auth.user');

    try {
      const transporter = MailRecord.createMailerTransporter();
      const info = await transporter.sendMail({
        from: {
          name: fromMailName,
          address: fromMailAddress,
        },
        ...mailOptions,
      });

      logger.log('sendMailSuccess:', info);
      return info;
    } catch (err) {
      app.error(err);
      throw err;
    }
  }
}

export default function MailRecordDefinition(Sequelize: Orm, db: DBInstance) {
  MailRecord.init(
    {
      user_uuid: { type: Sequelize.UUID, required: true },
      from: { type: Sequelize.STRING, required: true },
      to: { type: Sequelize.STRING, required: true },
      subject: { type: Sequelize.STRING, required: true },
      body: { type: Sequelize.TEXT },
      host: { type: Sequelize.STRING, required: true },
      port: { type: Sequelize.STRING, required: true },
      secure: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_success: { type: Sequelize.BOOLEAN, defaultValue: true },
      data: { type: Sequelize.JSON },
      error: { type: Sequelize.STRING(1000) },
    },
    {
      tableName: 'mail_record',
      sequelize: db,
    }
  );

  return MailRecord;
}
