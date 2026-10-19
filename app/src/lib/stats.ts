import type { GenreId } from '@/data/taxonomy';
import type { StringKey } from '@/i18n/strings';
import type { ShelfItem } from '@/store/LibraryProvider';

export type Badge = { id: 'first' | 'ten' | 'marathon' | 'explorer' | 'critic' | 'night'; icon: string; unlocked: boolean };
export type Persona = 'thrill' | 'heart' | 'world' | 'mind';

/** Average reading speed used for the "hours read" estimate (pages per hour). */
const PAGES_PER_HOUR = 40;

export function readingStats(items: ShelfItem[], year = new Date().getFullYear()) {
  const read = items.filter((i) => i.entry.status === 'read');
  const thisYear = read.filter((i) => i.entry.readAt?.startsWith(String(year)));
  const rated = read.filter((i) => i.entry.rating);

  const pages = read.reduce((s, i) => s + i.book.pages, 0);
  const pagesThisYear = thisYear.reduce((s, i) => s + i.book.pages, 0);
  const avgRating = rated.length ? rated.reduce((s, i) => s + (i.entry.rating ?? 0), 0) / rated.length : 0;

  const genreCount = new Map<GenreId, number>();
  for (const i of thisYear.length ? thisYear : read) {
    for (const g of i.book.genres) genreCount.set(g, (genreCount.get(g) ?? 0) + 1);
  }
  const topGenres = [...genreCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const favourite = [...thisYear].sort(
    (a, b) => (b.entry.rating ?? 0) - (a.entry.rating ?? 0) || (b.entry.readAt ?? '').localeCompare(a.entry.readAt ?? ''),
  )[0];

  const allGenres = new Set(read.flatMap((i) => i.book.genres));
  const reviews = items.filter((i) => i.entry.review?.trim()).length;

  const badges: Badge[] = [
    { id: 'first', icon: '📖', unlocked: items.length > 0 },
    { id: 'ten', icon: '🔟', unlocked: read.length >= 10 },
    { id: 'marathon', icon: '🏃', unlocked: read.some((i) => i.book.pages >= 700) },
    { id: 'explorer', icon: '🧭', unlocked: allGenres.size >= 5 },
    { id: 'critic', icon: '✍️', unlocked: reviews >= 10 },
    { id: 'night', icon: '🦉', unlocked: thisYear.length >= 25 },
  ];

  return {
    year,
    readCount: read.length,
    readThisYear: thisYear.length,
    pages,
    pagesThisYear,
    hoursThisYear: Math.round(pagesThisYear / PAGES_PER_HOUR),
    avgRating,
    topGenres,
    favourite,
    badges,
    persona: personaFor(topGenres.map(([g]) => g)),
  };
}

/** Where the reader should be today to hit their yearly goal. */
export function goalPace(done: number, goal: number, today = new Date()) {
  const start = new Date(today.getFullYear(), 0, 1).getTime();
  const end = new Date(today.getFullYear() + 1, 0, 1).getTime();
  const expected = Math.floor(((today.getTime() - start) / (end - start)) * goal);
  return { expected, diff: done - expected };
}

function personaFor(genres: GenreId[]): Persona {
  const top = genres[0];
  if (top === 'thriller' || top === 'mystery' || top === 'horror') return 'thrill';
  if (top === 'fantasy' || top === 'scifi') return 'world';
  if (top === 'nonfiction' || top === 'selfhelp') return 'mind';
  return 'heart';
}

export const badgeLabel = (id: Badge['id']) => `badge.${id}` as StringKey;
export const badgeDesc = (id: Badge['id']) => `badge.${id}.desc` as StringKey;
