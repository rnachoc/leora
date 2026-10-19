import { describe, it, expect } from '@jest/globals';
import { getBook } from '@/data/books';
import type { LibraryEntry } from '@/data/library';
import { localToday } from '@/lib/dates';
import { goalPace, readingStats } from '@/lib/stats';
import type { ShelfItem } from '@/store/LibraryProvider';

const item = (bookId: string, entry: Partial<LibraryEntry>): ShelfItem => ({
  book: getBook(bookId)!,
  entry: { bookId, status: 'read', addedAt: '2026-01-01', ...entry },
});

describe('readingStats', () => {
  const items = [
    item('nombre-viento', { rating: 5, readAt: '2026-03-01' }), // 880 pages, fantasy
    item('circe', { rating: 4, readAt: '2026-05-01' }), // fantasy, literary
    item('sapiens', { rating: 3, readAt: '2025-12-01' }), // last year
    item('dune', { status: 'want' }),
  ];
  const stats = readingStats(items, 2026);

  it('counts books and pages for the year separately from all time', () => {
    expect(stats.readCount).toBe(3);
    expect(stats.readThisYear).toBe(2);
    expect(stats.pagesThisYear).toBe(880 + 400);
    expect(stats.hoursThisYear).toBe(Math.round(1280 / 40));
  });

  it('averages ratings and picks the favourite of the year', () => {
    expect(stats.avgRating).toBeCloseTo(4);
    expect(stats.favourite?.book.id).toBe('nombre-viento');
  });

  it('finds the top genre and reader personality', () => {
    expect(stats.topGenres[0]).toEqual(['fantasy', 2]);
    expect(stats.persona).toBe('world');
  });

  it('unlocks badges from the library', () => {
    const unlocked = stats.badges.filter((b) => b.unlocked).map((b) => b.id);
    expect(unlocked).toEqual(expect.arrayContaining(['first', 'marathon']));
    expect(unlocked).not.toContain('ten');
  });
});

describe('goalPace', () => {
  it('compares books read with where the reader should be today', () => {
    const july1 = new Date(2026, 6, 1); // ~half the year
    expect(goalPace(12, 24, july1)).toEqual({ expected: 11, diff: 1 });
    expect(goalPace(5, 24, july1).diff).toBe(-6);
  });
});

describe('localToday', () => {
  it('uses the local calendar day, not UTC', () => {
    expect(localToday(new Date(2026, 9, 20, 0, 30))).toBe('2026-10-20');
    expect(localToday(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});
