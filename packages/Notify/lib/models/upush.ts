import { Model, Orm, DBInstance, TRPGApplication } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import md5Encrypt from 'packages/Player/lib/utils/md5';
import _ from 'lodash';
import { NotifyHistory } from './history';

// 友盟push

const UPUSH_URL = 'https://msgapi.umeng.com/api/send';

interface NotifyPushConfig {
  appKey: string;
  masterSecret: string;
  mipush: boolean;
  mi_activity: string;
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

  static findByUserUUID(userUUID: string): Promise<NotifyUPush> {
    return NotifyUPush.findOne({
      where: {
        user_uuid: userUUID,
      },
    });
  }

  /**
   * 根据设备id与用户uuid获取唯一设备
   * @param registration_id 设备id
   * @param user_uuid 用户uuid
   */
  static findByRegistrationAndUserUUID(
    registration_id: string,
    user_uuid: string
  ): Promise<NotifyUPush> {
    return NotifyUPush.findOne({
      where: {
        registration_id,
        user_uuid,
      },
    });
  }

  /**
   * 向当前实例设备发送推送信息
   */
  async sendNotifyMsg(
    app: TRPGApplication,
    text: string,
    title: string = '通知',
    extraBody?: {}
  ) {
    const upushConfig = app.get<NotifyPushConfig>('notify.upush');
    const { appKey, masterSecret, mipush, mi_activity } = upushConfig;
    if (!appKey || !masterSecret) {
      app.error(new Error('Send upush error. Need set upush config!'));
    }

    let body: object = {
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
          ...extraBody,
        },
      },
    };

    if (mipush) {
      // 使用厂商渠道
      body = {
        ...body,
        mipush: true,
        mi_activity, // TODO 需要校验一下是否可以不填写
      };
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

      // 创建历史记录
      await NotifyHistory.create({
        type: 'upush',
        platform: 'android',
        registration_id: this.registration_id,
        user_uuid: this.user_uuid,
        title,
        message: text,
        data: {
          upushResponse: res,
        },
      });

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
