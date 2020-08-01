import * as event from './event';
import BasePackage from 'lib/package';
import NoteNoteDefinition from './models/note';
import noteRouter from './routers/note';

export default class Note extends BasePackage {
  public name: string = 'Note';
  public require: string[] = ['Player'];
  public desc: string = '笔记模块';

  onInit(): void {
    this.regModel(NoteNoteDefinition);

    // 旧版事件
    this.regSocketEvent('note::get', event.get);
    this.regSocketEvent('note::save', event.save);

    // 新版事件
    this.regSocketEvent('note::getUserNotes', event.getUserNotes);
    this.regSocketEvent('note::createNote', event.createNote);
    this.regSocketEvent('note::saveNote', event.saveNote);

    this.regRoute(noteRouter);
  }
}
