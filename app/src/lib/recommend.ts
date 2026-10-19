import { CATALOG, getBook, type Book } from '@/data/books';
import type { LibraryEntry } from '@/data/library';
import { genreLabel, moodLabel, MOOD_TRAITS, type GenreId, type MoodId } from '@/data/taxonomy';
import type { StringKey } from '@/i18n/strings';
import type { Dismissal } from '@/store/LibraryProvider';

/**
 * Prototype recommender.
 *
 * Mirrors the production design (see docs/ARCHITECTURE.md): candidates come
 * from the real catalog, are ranked against the reader's taste profile and
 * every pick ships with an explanation grounded in their own library.
 * In production the ranking + wording step is done by an LLM in a Supabase
 * Edge Function; here it is a transparent scoring function.
 */

export type RecommendRequest =
  | { mode: 'genre'; genre: GenreId }
  | { mode: 'mood'; mood: MoodId }
  | { mode: 'like'; bookId: string };

export type Recommendation = { book: Book; why: string; score: number };

type Ctx = {
  entries: LibraryEntry[];
  /** Tastes stated in onboarding: a prior that matters most while there are few ratings. */
  preferences?: { genres: GenreId[]; moods: MoodId[] };
  dismissed: Dismissal[];
  locale: 'es' | 'en';
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
};

type Taste = {
  genres: Map<GenreId, number>;
  moods: Map<MoodId, number>;
  authors: Map<string, number>;
  rated: { book: Book; rating: number }[];
};

function tasteOf(entries: LibraryEntry[], preferences?: Ctx['preferences']): Taste {
  const taste: Taste = { genres: new Map(), moods: new Map(), authors: new Map(), rated: [] };
  const bump = <K,>(m: Map<K, number>, k: K, v: number) => m.set(k, (m.get(k) ?? 0) + v);
  for (const e of entries) {
    const book = getBook(e.bookId);
    if (!book) continue;
    let w = 0;
    if (e.status === 'read' && e.rating) {
      w = e.rating - 3; // 5★ → +2, 3★ → 0, 1★ → -2
      taste.rated.push({ book, rating: e.rating });
    } else if (e.status === 'dnf') w = -1.5;
    else if (e.status === 'want' || e.status === 'reading') w = 0.5;
    book.genres.forEach((g) => bump(taste.genres, g, w));
    book.moods.forEach((m) => bump(taste.moods, m, w));
    bump(taste.authors, book.author, w);
  }
  // Stated preferences count like ~one loved book each, so ratings take over as the library grows.
  preferences?.genres.forEach((g) => bump(taste.genres, g, 1.5));
  preferences?.moods.forEach((m) => bump(taste.moods, m, 1.5));
  taste.rated.sort((a, b) => b.rating - a.rating);
  return taste;
}

function overlap<T>(a: T[], b: T[]) {
  return a.filter((x) => b.includes(x));
}

function joinList(items: string[], and: string) {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(', ') + and + items[items.length - 1];
}

export function recommend(req: RecommendRequest, ctx: Ctx, count = 3): Recommendation[] {
  const { entries, dismissed, locale, t } = ctx;
  const taste = tasteOf(entries, ctx.preferences);
  const owned = new Set(entries.map((e) => e.bookId));
  const dismissedIds = new Set(dismissed.map((d) => d.bookId));
  const avoidAuthors = new Set(
    dismissed.filter((d) => d.reason === 'author').map((d) => getBook(d.bookId)?.author),
  );
  const avoidLong = dismissed.some((d) => d.reason === 'tooLong');
  const seed = req.mode === 'like' ? getBook(req.bookId) : undefined;

  const candidates = CATALOG.filter(
    (b) => !owned.has(b.id) && !dismissedIds.has(b.id) && !avoidAuthors.has(b.author),
  );

  const scored = candidates.map((book) => {
    let score = 0;
    book.genres.forEach((g) => (score += taste.genres.get(g) ?? 0));
    book.moods.forEach((m) => (score += (taste.moods.get(m) ?? 0) * 0.8));
    score += (taste.authors.get(book.author) ?? 0) * 1.5;
    if (avoidLong && book.pages > 500) score -= 6;

    let matches = true;
    if (req.mode === 'genre') matches = book.genres.includes(req.genre);
    if (req.mode === 'mood') matches = book.moods.includes(req.mood);
    if (req.mode === 'like' && seed) {
      const g = overlap(book.genres, seed.genres).length;
      const m = overlap(book.moods, seed.moods).length;
      matches = g + m > 0;
      score += g * 4 + m * 3 + (book.author === seed.author ? 5 : 0);
      score -= Math.abs(book.pages - seed.pages) / 200;
    }
    return { book, score: matches ? score + 20 : score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, count).map(({ book, score }) => ({ book, score, why: explain(book) }));

  function explain(book: Book): string {
    const lines: string[] = [];

    // 1. Same author as a book they rated well.
    const byAuthor = taste.rated.find((r) => r.book.author === book.author && r.rating >= 4);
    if (byAuthor) {
      lines.push(t('why.author', { author: book.author, stars: byAuthor.rating, seed: byAuthor.book.title }));
    }

    // 2. The seed book for "like…", or their best-rated book sharing the most with this one.
    if (seed) {
      const shared = [
        ...overlap(book.genres, seed.genres).map((g) => genreLabel(g, locale).toLowerCase()),
        ...overlap(book.moods, seed.moods).map((m) => MOOD_TRAITS[m][locale]),
      ].slice(0, 2);
      if (shared.length) lines.push(t('why.likeSeed', { seed: seed.title, shared: joinList(shared, t('why.and')) }));
    } else if (!byAuthor) {
      const best = taste.rated
        .filter((r) => r.rating >= 4)
        .map((r) => ({
          ...r,
          sharedMoods: overlap(book.moods, r.book.moods),
          sharedGenres: overlap(book.genres, r.book.genres),
        }))
        .sort(
          (a, b) =>
            b.sharedMoods.length + b.sharedGenres.length - (a.sharedMoods.length + a.sharedGenres.length) ||
            b.rating - a.rating,
        )[0];
      if (best && best.sharedMoods.length + best.sharedGenres.length > 0) {
        const trait = best.sharedMoods.length
          ? MOOD_TRAITS[best.sharedMoods[0]][locale]
          : genreLabel(best.sharedGenres[0], locale).toLowerCase();
        lines.push(t('why.taste', { seed: best.book.title, stars: best.rating, trait }));
      }
    }

    // 3. What they asked for.
    if (req.mode === 'mood' && book.moods.includes(req.mood)) {
      lines.push(t('why.mood', { mood: moodLabel(req.mood, locale).toLowerCase() }));
    }

    if (!lines.length) lines.push(t('why.fallback'));
    return lines.slice(0, 2).join(' ');
  }
}

/** Store search links. Production generates these server-side from the ISBN with affiliate tags. */
export function storeLinks(book: Book) {
  const q = encodeURIComponent(`${book.title} ${book.author}`);
  return [
    { id: 'amazon', label: 'Amazon', url: `https://www.amazon.es/s?k=${q}&i=stripbooks` },
    { id: 'casadellibro', label: 'Casa del Libro', url: `https://www.casadellibro.com/busqueda-generica?busqueda=${q}` },
    { id: 'fnac', label: 'Fnac', url: `https://www.fnac.es/SearchResult/ResultList.aspx?Search=${q}` },
    { id: 'kobo', label: 'Kobo', url: `https://www.kobo.com/es/es/search?query=${q}` },
    { id: 'audible', label: 'Audible', url: `https://www.audible.es/search?keywords=${q}` },
  ];
}
