import striptags from 'striptags';
import {
  Model,
  Orm,
  DBInstance,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin,
} from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';
import _ from 'lodash';
import createUUID from 'uuid/v1';
import { isUUID } from 'lib/helper/string-helper';

declare module 'packages/Player/lib/models/user' {
  interface PlayerUser {
    getNotes?: HasManyGetAssociationsMixin<NoteNote>;
  }
}

export class NoteNote extends Model {
  uuid: string;
  title: string;
  content: string;
  data: object; // 前端slate的结构化数据

  createdAt: Date;
  updatedAt: Date;
  getOwner?: BelongsToGetAssociationMixin<PlayerUser>;

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
   * 获取用户的所有笔记
   * @param userUUID 用户UUID
   */
  static async getUserNotes(userUUID: string): Promise<NoteNote[]> {
    const user = await PlayerUser.findByUUID(userUUID);
    const notes = await user.getNotes();

    return notes;
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
    if (_.isNil(uuid)) {
      throw new Error('保存笔记失败, 缺少必要参数');
    }

    const user = await PlayerUser.findByUUID(userUUID);
    if (_.isNil(user)) {
      throw new Error('保存笔记失败, 用户不存在');
    }

    const note = await NoteNote.findByUUID(uuid);
    if (_.isNil(note)) {
      if (!isUUID(uuid)) {
        // 如果不是一个合法的UUID
        uuid = createUUID();
      }

      // 创建
      const newNote = await NoteNote.create({
        uuid,
        title,
        data,
        ownerId: user.id,
      });

      return newNote;
    } else {
      const owner = await note.getOwner();
      if (owner.uuid != user.uuid) {
        throw new Error('保存失败, 笔记所有权不属于你');
      }

      // 更新
      note.title = title;
      note.data = data;
      await note.save();

      return note;
    }
  }

  /**
   * 删除笔记
   * @param noteUUID 笔记UUID
   * @param userUUID 操作人UUID
   */
  static async deleteNote(noteUUID: string, userUUID: string): Promise<void> {
    if (_.isNil(noteUUID) || _.isNil(userUUID)) {
      throw new Error('移除笔记失败, 缺少必要参数');
    }

    const user = await PlayerUser.findByUUID(userUUID);
    const rows = await NoteNote.destroy({
      where: {
        uuid: noteUUID,
        ownerId: user.id,
      },
    });

    if (rows === 0) {
      throw new Error('移除笔记失败, 没有找到该笔记');
    }
  }

  /**
   * 创建笔记
   * 没有参数版本的保存笔记
   * @param userUUID 用户的UUID
   */
  static async createNote(userUUID: string): Promise<NoteNote> {
    const note = await NoteNote.saveNote(createUUID(), '未命名', [], userUUID);

    return note;
  }

  /**
   * 获取笔记的完整信息
   * @param noteUUID 笔记UUID
   */
  static async getNoteFullInfo(noteUUID: string) {
    const note = await NoteNote.findByUUID(noteUUID);
    const owner: PlayerUser = await note.getOwner();

    const uuid = note.uuid;
    const title = note.title;
    const content = note.content;
    const data = note.data;
    const createdAt = note.createdAt;
    const updatedAt = note.updatedAt;
    const summary = note.getSummary();
    const cover = note.getCoverImage();
    const authorName = owner.getName();

    return {
      uuid,
      title,
      content,
      data,
      createdAt,
      updatedAt,
      summary,
      cover,
      authorName,
    };
  }

  getCoverImage() {
    let content = this.content ?? '';
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
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        unique: true,
        required: true,
      },
      title: { type: Sequelize.STRING, required: true },
      content: { type: Sequelize.TEXT },
      data: { type: Sequelize.JSON },
    },
    {
      tableName: 'note_note',
      sequelize: db,
      paranoid: true,
    }
  );

  NoteNote.belongsTo(PlayerUser, {
    foreignKey: 'ownerId',
    as: 'owner',
  });
  PlayerUser.hasMany(NoteNote, {
    foreignKey: 'ownerId',
    as: 'notes',
  });

  return NoteNote;
}
