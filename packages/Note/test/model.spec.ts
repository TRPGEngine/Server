import { NoteNote } from '../lib/models/note';
import createUUID from 'uuid/v1';
import { getTestUser } from 'packages/Player/test/example';
import { buildAppContext } from 'test/utils/app';
import { regAutoClear } from 'test/utils/example';

const context = buildAppContext();
regAutoClear();

describe('NoteNote', () => {
  describe('NoteNote.saveNote', () => {
    test('saveNote should create note if non exist', async () => {
      const testUser = await getTestUser();
      const uuid = createUUID();
      const data = [{ fakeData: true }];
      const note = await NoteNote.saveNote(
        uuid,
        'test title',
        data,
        testUser.uuid
      );

      try {
        expect(note.uuid).toBe(uuid);
        expect(note.title).toBe('test title');
        expect(note.data).toMatchObject(data);
      } finally {
        await note.destroy({ force: true });
      }
    });

    test('saveNote should update note if exist', async () => {
      const testUser = await getTestUser();
      const uuid = createUUID();
      const data1 = [{ fakeData: true }];
      const data2 = [{ fakeData: false }];
      const note1 = await NoteNote.saveNote(
        uuid,
        'test title',
        data1,
        testUser.uuid
      );
      const note2 = await NoteNote.saveNote(
        uuid,
        'test title2',
        data2,
        testUser.uuid
      );

      try {
        expect(note2.uuid).toBe(uuid);
        expect(note2.title).toBe('test title2');
        expect(note2.data).toMatchObject(data2);
      } finally {
        await note1.destroy({ force: true });
        await note2.destroy({ force: true });
      }
    });
  });
});
