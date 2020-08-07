import { NoteNote } from '../lib/models/note';
import createUUID from 'uuid/v1';
import { getTestUser } from 'packages/Player/test/example';
import { buildAppContext } from 'test/utils/app';
import { regAutoClear } from 'test/utils/example';
import { createTestNote } from './example';

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

  test('NoteNote.createNote should be ok', async () => {
    const testUser = await getTestUser();
    const note = await NoteNote.createNote(testUser.uuid);

    try {
      expect(note).toHaveProperty('uuid');
      expect(note.title).toBe('未命名');
      expect(Array.isArray(note.data)).toBe(true);
      expect(note.data).toMatchObject([]);
      expect((await note.getOwner()).id).toBe(testUser.id);
    } finally {
      await note.destroy({ force: true });
    }
  });

  test('NoteNote.getUserNotes should be ok', async () => {
    const testUser = await getTestUser();
    const note = await createTestNote(testUser.id);

    try {
      const notes = await NoteNote.getUserNotes(testUser.uuid);
      const index = notes.findIndex((item) => item.uuid === note.uuid);
      expect(index).toBeGreaterThanOrEqual(0);
    } finally {
      await note.destroy({ force: true });
    }
  });

  test('NoteNote.deleteNote should be ok', async () => {
    const testUser = await getTestUser();
    const note = await NoteNote.create({
      title: 'test',
      data: [],
      ownerId: testUser.id,
    });

    try {
      await NoteNote.deleteNote(note.uuid, testUser.uuid);

      expect(await NoteNote.findByUUID(note.uuid)).toBeNull();
    } finally {
      await note.destroy({ force: true });
    }
  });
});
