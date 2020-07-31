import striptags from 'striptags';
import { Model, Orm, DBInstance } from 'trpg/core';
import { PlayerUser } from 'packages/Player/lib/models/user';

export class NoteNote extends Model {
  uuid: string;
  title: string;
  content: string;

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
