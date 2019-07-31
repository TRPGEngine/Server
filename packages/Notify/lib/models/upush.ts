import { Model, Orm, DBInstance, TRPGApplication } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import md5Encrypt from 'packages/Player/lib/utils/md5';

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
  device_tokens: string;
  user_uuid: string;
  is_active: boolean;

  /**
   * 向当前设备发送推送信息
   */
  async sendNotifyMsg(app: TRPGApplication, msg: string) {
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
      device_tokens: this.device_tokens,
      payload: {
        display_type: 'message',
        body: {
          custom: msg,
        },
      },

      // 使用厂商渠道
      mipush: true,
      mi_activity: 'com.moonrailgun.trpg', // TODO 需要校验一下是否可以不填写
    };

    // 创建签名
    const sign = md5Encrypt(
      `POST${UPUSH_URL}${JSON.stringify(body)}${masterSecret}`
    );

    const res = await app.request.post<UPushResponse>(
      `${UPUSH_URL}?sign=${sign}`,
      body
    );

    if (res.ret === 'FAIL') {
      throw new Error(res.data.error_msg);
    }

    // 创建历史记录

    return res.data.msg_id;
  }
}

export default function UPushDefinition(Sequelize: Orm, db: DBInstance) {
  NotifyUPush.init(
    {
      device_tokens: {
        type: Sequelize.STRING,
        required: true,
        unique: true,
      },
      user_uuid: {
        type: Sequelize.UUID,
        required: true,
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
