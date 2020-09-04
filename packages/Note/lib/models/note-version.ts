import { Model, DBInstance, Orm, HasManyGetAssociationsMixin } from 'trpg/core';
import { NoteNote } from './note';
import { PlayerUser } from 'packages/Player/lib/models/user';

declare module 'packages/Note/lib/models/note' {
  interface NoteNote {
    getVersions?: HasManyGetAssociationsMixin<NoteNoteVersion>;
  }
}

/**
 * 笔记版本是一个用于永久存储笔记历史的工具
 */
export class NoteNoteVersion extends Model {
  uuid: string;
  title: string;
  data: object; // 前端slate的结构化数据
  comment: string; // 备注

  /**
   * 创建笔记版本
   * @param noteUUID 笔记UUID
   * @param userUUID 操作者UUID
   * @param comment 备注
   */
  static async createNoteVersion(
    noteUUID: string,
    userUUID: string,
    comment?: string
  ): Promise<NoteNoteVersion> {
    const note = await NoteNote.findByUUID(noteUUID);
    const owner: PlayerUser = await note.getOwner();
    if (owner.uuid !== userUUID) {
      throw new Error('没有权限');
    }

    const version = await NoteNoteVersion.create({
      title: note.title,
      data: note.data,
      comment,
    });

    return version;
  }
}

export default function NoteNoteVersionDefinition(
  Sequelize: Orm,
  db: DBInstance
) {
  NoteNoteVersion.init(
    {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        unique: true,
        required: true,
      },
      title: { type: Sequelize.STRING, required: true },
      data: { type: Sequelize.JSON },
      comment: { type: Sequelize.STRING },
    },
    {
      tableName: 'note_note_version',
      sequelize: db,
      paranoid: true,
    }
  );

  NoteNoteVersion.belongsTo(NoteNote, {
    foreignKey: 'noteId',
    as: 'note',
  });
  NoteNote.hasMany(NoteNoteVersion, {
    foreignKey: 'noteId',
    as: 'versions',
  });

  return NoteNoteVersion;
}
