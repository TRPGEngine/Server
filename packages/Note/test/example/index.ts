import { NoteNote } from 'packages/Note/lib/models/note';

export async function createTestNote(userId: number): Promise<NoteNote> {
  const note = await NoteNote.create({
    title: 'test note',
    data: [],
    ownerId: userId,
  });

  return note;
}
