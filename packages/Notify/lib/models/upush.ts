import { Model, Orm, DBInstance, TRPGApplication } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import md5Encrypt from 'packages/Player/lib/utils/md5';
import _ from 'lodash';

// 友盟push

const UPUSH_URL = 'https://msgapi.umeng.com/api/send';

interface NotifyPushConfig {
  appKey: string;
  masterSecret: string;
}
interface UPushResponse {
  ret: 'SUCCESS' | 'FAIL';
  data: {
    msg_id?: string;
    error_code?: string;
    error_msg?: string;
  };
}

export class NotifyUPush extends Model {
  registration_id: string;
  user_uuid: string;
  user_tags: string[];
  is_active: boolean;

  /**
   * 向当前设备发送推送信息
   */
  async sendNotifyMsg(
    app: TRPGApplication,
    text: string,
    title: string = '通知',
    mipush: boolean = false
  ) {
    const upushConfig = app.get<NotifyPushConfig>('notify.upush');
    const { appKey, masterSecret } = upushConfig;
    if (!appKey || !masterSecret) {
      app.error(new Error('Send upush error. Need set upush config!'));
    }

    const body = {
      appkey: appKey,
      timestamp: new Date().valueOf(),
      type: 'unicast',
      production_mode: true,
      device_tokens: this.registration_id,
      payload: {
        display_type: 'notification',
        body: {
          ticker: '来自TRPG的通知',
          title,
          text,
        },
      },
    };

    if (mipush) {
      // TODO
      // body = {
      //   ...body,
      //   // 使用厂商渠道
      //   // mipush: true,
      //   // mi_activity: 'com.moonrailgun.trpg', // TODO 需要校验一下是否可以不填写
      // }
    }

    // 创建签名
    const sign = md5Encrypt(
      `POST${UPUSH_URL}${JSON.stringify(body)}${masterSecret}`
    );

    try {
      const res = await app.request.post<UPushResponse>(
        `${UPUSH_URL}?sign=${sign}`,
        body
      );
      // TODO: 创建历史记录

      return res.data.msg_id;
    } catch (err) {
      console.error(err);
      throw new Error(_.get(err, 'response.data.data.error_msg'));
    }
  }
}

export default function NotifyUPushDefinition(Sequelize: Orm, db: DBInstance) {
  NotifyUPush.init(
    {
      registration_id: {
        type: Sequelize.STRING,
        required: true,
        unique: true,
      },
      user_uuid: {
        type: Sequelize.UUID,
        required: true,
      },
      user_tags: {
        type: Sequelize.JSON,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
      },
    },
    { tableName: 'notify_upush', sequelize: db }
  );

  NotifyUPush.belongsTo(PlayerUser, { as: 'user' });

  return NotifyUPush;
}
