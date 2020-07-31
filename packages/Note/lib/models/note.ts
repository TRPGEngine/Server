import striptags from 'striptags';
import { Model, Orm, DBInstance } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';

export class NoteNote extends Model {
  uuid: string;
  title: string;
  content: string;
  data: object; // 前端slate的结构化数据

  /**
   * 根据笔记UUID查找笔记
   * @param uuid 笔记UUID
   */
  static async findByUUID(uuid: string): Promise<NoteNote> {
    const note = await NoteNote.findOne({
      where: {
        uuid,
      },
    });

    return note;
  }

  /**
   * 保存笔记
   * @param uuid 笔记UUID
   * @param title 笔记标题
   * @param data 笔记的结构化数据
   * @param userUUID 用户的UUID
   */
  static async saveNote(
    uuid: string,
    title: string,
    data: object,
    userUUID: string
  ): Promise<NoteNote> {
    const user = await PlayerUser.findByUUID(userUUID);
    if (_.isNil(user)) {
      throw new Error('保存笔记失败, 用户不存在');
    }

    const note = await NoteNote.findByUUID(uuid);
    if (_.isNil(note)) {
      // 创建
      const newNote = await NoteNote.create({
        uuid,
        title,
        data,
        ownerId: user.id,
      });

      return newNote;
    } else {
      // 更新
      note.title = title;
      note.data = data;
      await note.save();

      return note;
    }
  }

  getCoverImage() {
    let content = this.content;
    let imgIndex = content.indexOf('<img');
    if (imgIndex >= 0) {
      let match = content.match(/<img.*?src="(.*?)".*?>/);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  getSummary() {
    let content = this.content;
    let summary = striptags(content) || '';
    summary = summary.substr(0, 100).trim() + '...'; // 长度100
    return summary;
  }
}

export default function NoteNoteDefinition(Sequelize: Orm, db: DBInstance) {
  NoteNote.init(
    {
      uuid: { type: Sequelize.UUID, required: true },
      title: { type: Sequelize.STRING, required: true },
      content: { type: Sequelize.TEXT },
      data: { type: Sequelize.JSON },
    },
    {
      tableName: 'note_note',
      sequelize: db,
    }
  );

  NoteNote.belongsTo(PlayerUser, {
    foreignKey: 'ownerId',
    as: 'owner',
  });
  PlayerUser.hasOne(NoteNote, {
    foreignKey: 'ownerId',
    as: 'notes',
  });

  return NoteNote;
}
