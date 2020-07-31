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

    this.regSocketEvent('note::get', event.get);
    this.regSocketEvent('note::save', event.save);

    this.regRoute(noteRouter);
  }
}
