import { describe, it, expect } from '@jest/globals';
import { makeT } from './helpers';
import { getBook } from '@/data/books';
import { DEMO_LIBRARY, type LibraryEntry } from '@/data/library';
import { recommend } from '@/lib/recommend';

const t = makeT('es');
const base = { entries: DEMO_LIBRARY, dismissed: [], locale: 'es' as const, t };

describe('recommend', () => {
  it('returns three picks, never a book already in the library', () => {
    const owned = new Set(DEMO_LIBRARY.map((e) => e.bookId));
    for (const req of [
      { mode: 'genre', genre: 'thriller' },
      { mode: 'mood', mood: 'heartbreak' },
      { mode: 'like', bookId: 'circe' },
    ] as const) {
      const picks = recommend(req, base);
      expect(picks).toHaveLength(3);
      picks.forEach((p) => expect(owned.has(p.book.id)).toBe(false));
    }
  });

  it('only picks books of the requested genre while there are enough', () => {
    recommend({ mode: 'genre', genre: 'fantasy' }, base).forEach((p) => expect(p.book.genres).toContain('fantasy'));
  });

  it('explains every pick in the reader’s language', () => {
    recommend({ mode: 'mood', mood: 'unputdownable' }, base).forEach((p) => {
      expect(p.why.length).toBeGreaterThan(10);
      expect(p.why).not.toMatch(/why\.|\{/); // no raw keys or unfilled placeholders
    });
  });

  it('refers to the same author when they loved another of their books', () => {
    const entries: LibraryEntry[] = [{ bookId: 'reina-roja', status: 'read', rating: 5, addedAt: '2026-01-01' }];
    const picks = recommend({ mode: 'genre', genre: 'thriller' }, { ...base, entries });
    const byAuthor = picks.find((p) => p.book.author === 'Juan Gómez-Jurado');
    expect(byAuthor?.why).toContain('Juan Gómez-Jurado');
  });

  it('respects dismissals: the book, and the whole author when that was the reason', () => {
    const first = recommend({ mode: 'genre', genre: 'thriller' }, base)[0];
    const again = recommend(
      { mode: 'genre', genre: 'thriller' },
      { ...base, dismissed: [{ bookId: first.book.id, reason: 'author' }] },
    );
    again.forEach((p) => {
      expect(p.book.id).not.toBe(first.book.id);
      expect(p.book.author).not.toBe(first.book.author);
    });
  });

  it('uses onboarding tastes when the library is empty', () => {
    const picks = recommend(
      { mode: 'mood', mood: 'escape' },
      { ...base, entries: [], preferences: { genres: ['fantasy'], moods: ['escape'] } },
    );
    expect(picks.filter((p) => p.book.genres.includes('fantasy')).length).toBeGreaterThanOrEqual(2);
  });

  it('finds books similar to the seed for "like…"', () => {
    const seed = getBook('reina-roja')!;
    recommend({ mode: 'like', bookId: seed.id }, base).forEach((p) => {
      const shares =
        p.book.genres.some((g) => seed.genres.includes(g)) || p.book.moods.some((m) => seed.moods.includes(m));
      expect(shares).toBe(true);
    });
  });
});
