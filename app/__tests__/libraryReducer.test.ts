import { describe, it, expect } from '@jest/globals';
import { localToday } from '@/lib/dates';
import { DEMO_STATE, libraryReducer, type LibraryState } from '@/store/LibraryProvider';

const empty: LibraryState = { ...DEMO_STATE, entries: [], dismissed: [] };

describe('libraryReducer', () => {
  it('adds a read book with today as read date, and ignores duplicates', () => {
    const s1 = libraryReducer(empty, { type: 'add', bookId: 'dune', status: 'read', rating: 4 });
    expect(s1.entries[0]).toMatchObject({ bookId: 'dune', status: 'read', rating: 4, readAt: localToday() });
    const s2 = libraryReducer(s1, { type: 'add', bookId: 'dune', status: 'want' });
    expect(s2).toBe(s1);
  });

  it('starts progress at 0 when a book is added or moved to "reading"', () => {
    const added = libraryReducer(empty, { type: 'add', bookId: 'dune', status: 'reading' });
    expect(added.entries[0].progress).toBe(0);
    const want = libraryReducer(empty, { type: 'add', bookId: 'circe', status: 'want' });
    const moved = libraryReducer(want, { type: 'update', bookId: 'circe', patch: { status: 'reading' } });
    expect(moved.entries[0].progress).toBe(0);
  });

  it('sets the read date when a book is marked as read, keeping an existing one', () => {
    const reading = libraryReducer(empty, { type: 'add', bookId: 'dune', status: 'reading' });
    const done = libraryReducer(reading, { type: 'update', bookId: 'dune', patch: { status: 'read' } });
    expect(done.entries[0].readAt).toBe(localToday());
    const kept = libraryReducer(
      { ...empty, entries: [{ bookId: 'x', status: 'dnf', readAt: '2026-01-01', addedAt: '2026-01-01' }] },
      { type: 'update', bookId: 'x', patch: { status: 'read' } },
    );
    expect(kept.entries[0].readAt).toBe('2026-01-01');
  });

  it('removes books and records dismissals', () => {
    const s = libraryReducer(empty, { type: 'add', bookId: 'dune', status: 'want' });
    expect(libraryReducer(s, { type: 'remove', bookId: 'dune' }).entries).toHaveLength(0);
    expect(libraryReducer(s, { type: 'dismiss', bookId: 'perdida', reason: 'tooLong' }).dismissed).toEqual([
      { bookId: 'perdida', reason: 'tooLong' },
    ]);
  });

  it('counts free recommendations and unlocks Premium', () => {
    const used = libraryReducer(empty, { type: 'useRecommendation' });
    expect(used.profile.freeRecommendationsUsed).toBe(empty.profile.freeRecommendationsUsed + 1);
    expect(libraryReducer(used, { type: 'setPremium', value: true }).profile.isPremium).toBe(true);
  });

  it('builds a fresh library from the onboarding answers', () => {
    const s = libraryReducer(DEMO_STATE, {
      type: 'completeOnboarding',
      answers: {
        name: '  Nacho ',
        readingPace: 'avid',
        favoriteGenres: ['thriller'],
        favoriteMoods: ['dark'],
        favoriteBookIds: ['reina-roja', 'perdida'],
        yearlyGoal: 60,
      },
    });
    expect(s.entries.map((e) => [e.bookId, e.status, e.rating, e.readAt])).toEqual([
      ['reina-roja', 'read', 5, undefined],
      ['perdida', 'read', 5, undefined],
    ]);
    expect(s.profile).toMatchObject({
      name: 'Nacho',
      username: 'nacho',
      yearlyGoal: 60,
      onboarded: true,
      isPremium: false,
      freeRecommendationsUsed: 0,
      favoriteGenres: ['thriller'],
    });
  });

  it('can explore the demo or start over', () => {
    expect(libraryReducer(empty, { type: 'startDemo' }).profile.onboarded).toBe(true);
    expect(libraryReducer(empty, { type: 'reset' })).toBe(DEMO_STATE);
  });
});
