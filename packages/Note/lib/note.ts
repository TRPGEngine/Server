import * as event from './event';
import BasePackage from 'lib/package';
import NoteNoteDefinition, { NoteNote } from './models/note';
import noteRouter from './routers/note';
import NoteNoteVersionDefinition from './models/note-version';
import noteVersionRouter from './routers/note-version';
import { regGroupPanelHandler } from 'packages/Group/lib/panels/reg';
import _ from 'lodash';
import { NoReportError } from 'lib/error';

export default class Note extends BasePackage {
  public name: string = 'Note';
  public require: string[] = ['Player', 'Group'];
  public desc: string = '笔记模块';

  onInit(): void {
    this.regModel(NoteNoteDefinition);
    this.regModel(NoteNoteVersionDefinition);

    // 旧版事件
    this.regSocketEvent('note::get', event.get);
    this.regSocketEvent('note::save', event.save);

    // 新版事件
    this.regSocketEvent('note::getUserNotes', event.getUserNotes);
    this.regSocketEvent('note::createNote', event.createNote);
    this.regSocketEvent('note::saveNote', event.saveNote);
    this.regSocketEvent('note::deleteNote', event.deleteNote);

    this.regRoute(noteRouter);
    this.regRoute(noteVersionRouter);

    // 笔记类型的团面板
    regGroupPanelHandler('note', {
      async onCreate(panelInfo) {
        const targetUUID = panelInfo.extra.noteUUID;
        if (!_.isString(targetUUID)) {
          throw new NoReportError('需要指定笔记');
        }

        const note = await NoteNote.findByUUID(targetUUID);
        if (_.isNil(note)) {
          throw new Error('指定笔记不存在');
        }

        return {
          targetUUID,
          other: {
            note: note.toJSON(),
          },
        };
      },
      async onDestroy(panel, options) {
        // 删除无操作
      },
    });
  }
}
