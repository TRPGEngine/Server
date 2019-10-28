import { Orm, DBInstance, Model } from 'trpg/core';
import { ChatMessagePayload } from 'packages/Chat/types/message';
import { GroupGroup } from './group';

export class GroupDetail extends Model {
  master_name: string; // 主持人称呼: 守密人， 地下城主, ...
  background_image_url: string; // 团聊天背景URL
  welcome_msg_payload: ChatMessagePayload; // 新用户欢迎信息
  allow_quick_dice: boolean;
}

export default function GroupDetailDefinition(Sequelize: Orm, db: DBInstance) {
  GroupDetail.init(
    {
      master_name: {
        type: Sequelize.STRING,
      },
      background_image_url: {
        type: Sequelize.STRING,
      },
      welcome_msg_payload: {
        type: Sequelize.JSON,
      },
      allow_quick_dice: {
        type: Sequelize.BOOLEAN,
      },
    },
    {
      tableName: 'group_detail',
      sequelize: db,
    }
  );

  GroupDetail.belongsTo(GroupGroup, { as: 'group' });

  return GroupDetail;
}
