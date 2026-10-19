import type { Book } from '@/data/books';
import type { GenreId, MoodId } from '@/data/taxonomy';
import { norm } from './text';

/**
 * Live book catalog.
 *
 * Primary source: Open Library (free, no key, CORS-enabled, good covers).
 * Optional: Google Books, used for search when EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY
 * is set (unauthenticated Google Books requests have no quota any more).
 */

const OL = 'https://openlibrary.org';
const OL_COVERS = 'https://covers.openlibrary.org/b/id';
const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;

/** Elegant spine/cover tones for books whose colour we don't know. */
const PALETTE = [
  '#5B2A2A',
  '#1F5C4F',
  '#26323F',
  '#6E5420',
  '#7A2E35',
  '#3E4A57',
  '#2D3B2C',
  '#4A3B2A',
  '#3A5F7A',
  '#8A4F7D',
  '#B5652B',
  '#2F4858',
];

function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

const GENRE_KEYWORDS: [GenreId, string[]][] = [
  ['thriller', ['thriller', 'suspense', 'suspenso']],
  ['mystery', ['mystery', 'detective', 'misterio', 'policiac', 'crime', 'crimen', 'noir']],
  ['horror', ['horror', 'terror', 'ghost', 'vampire', 'supernatural']],
  ['fantasy', ['fantasy', 'fantasia', 'magic', 'magia', 'dragon', 'wizard']],
  ['scifi', ['science fiction', 'ciencia ficcion', 'space opera', 'dystopia', 'distopia', 'cyberpunk']],
  ['romance', ['romance', 'love stories', 'novela romantica']],
  ['historical', ['historical fiction', 'novela historica', 'history', 'historia']],
  [
    'selfhelp',
    [
      'self-help',
      'self help',
      'autoayuda',
      'personal development',
      'desarrollo personal',
      'habits',
      'success',
      'motivation',
    ],
  ],
  [
    'nonfiction',
    [
      'biography',
      'biografia',
      'psychology',
      'psicologia',
      'philosophy',
      'filosofia',
      'science',
      'essays',
      'ensayo',
      'economics',
      'nonfiction',
      'non-fiction',
    ],
  ],
  ['drama', ['domestic fiction', 'family', 'familia', 'drama', 'friendship']],
  ['literary', ['literary fiction', 'literatura', 'classic', 'clasicos', 'novela']],
];

const GENRE_MOODS: Partial<Record<GenreId, MoodId[]>> = {
  thriller: ['unputdownable', 'dark'],
  mystery: ['dark', 'unputdownable'],
  horror: ['dark'],
  fantasy: ['escape'],
  scifi: ['escape', 'learn'],
  romance: ['heartbreak', 'light'],
  drama: ['heartbreak'],
  selfhelp: ['learn', 'light'],
  nonfiction: ['learn'],
  historical: ['escape'],
};

/** Maps free-form catalog subjects ("Detective and mystery stories", "Autoayuda") to our genres and moods. */
export function classify(subjects: string[] = []): { genres: GenreId[]; moods: MoodId[] } {
  const text = norm(subjects.slice(0, 40).join(' | '));
  let matched = GENRE_KEYWORDS.filter(([, words]) => words.some((w) => text.includes(w))).map(([g]) => g);
  // "science" also matches "science fiction": that's not non-fiction.
  if (matched.includes('scifi')) matched = matched.filter((g) => g !== 'nonfiction');
  const genres = matched.slice(0, 3);
  if (!genres.length && text.includes('fiction')) genres.push('literary');
  const moods = [...new Set(genres.flatMap((g) => GENRE_MOODS[g] ?? []))].slice(0, 3);
  return { genres, moods };
}

const sanePages = (n?: number) => (n && n > 20 && n < 2000 ? Math.round(n) : 0);

// ——— Open Library ———

type OLDoc = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  cover_i?: number;
  subject?: string[];
};

const OL_FIELDS = 'key,title,author_name,first_publish_year,number_of_pages_median,cover_i,subject';

function fromOpenLibrary(d: OLDoc): Book {
  const id = `ol:${d.key.replace('/works/', '')}`;
  const { genres, moods } = classify(d.subject);
  const book: Book = {
    id,
    title: d.title,
    author: d.author_name?.slice(0, 2).join(', ') || '—',
    year: d.first_publish_year ?? 0,
    pages: sanePages(d.number_of_pages_median),
    genres,
    moods,
    color: colorFor(id),
    synopsis: { es: '', en: '' },
    source: 'openlibrary',
  };
  if (d.cover_i) book.coverUrl = `${OL_COVERS}/${d.cover_i}-M.jpg`;
  return book;
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Catalog request failed (${res.status})`);
  return (await res.json()) as T;
}

// ——— Google Books (optional) ———

type GBVolume = {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    description?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
};

function fromGoogleBooks(v: GBVolume): Book {
  const i = v.volumeInfo;
  const id = `gb:${v.id}`;
  const { genres, moods } = classify(i.categories);
  const book: Book = {
    id,
    title: i.title,
    author: i.authors?.slice(0, 2).join(', ') || '—',
    year: Number(i.publishedDate?.slice(0, 4)) || 0,
    pages: sanePages(i.pageCount),
    genres,
    moods,
    color: colorFor(id),
    synopsis: { es: i.description ?? '', en: i.description ?? '' },
    source: 'googlebooks',
  };
  const thumb = i.imageLinks?.thumbnail ?? i.imageLinks?.smallThumbnail;
  if (thumb) book.coverUrl = thumb.replace('http://', 'https://').replace('&edge=curl', '');
  return book;
}

// ——— Public API ———

/** Full-text search by title or author. */
export async function searchBooks(query: string, signal?: AbortSignal): Promise<Book[]> {
  const q = encodeURIComponent(query.trim());
  if (GOOGLE_KEY) {
    const data = await getJson<{ items?: GBVolume[] }>(
      `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=20&printType=books&key=${GOOGLE_KEY}`,
      signal,
    );
    return (data.items ?? []).map(fromGoogleBooks);
  }
  // Ask for more than we show: Open Library often has several work records for one book.
  const data = await getJson<{ docs: OLDoc[] }>(`${OL}/search.json?q=${q}&fields=${OL_FIELDS}&limit=40`, signal);
  return dedupe(data.docs.filter((d) => d.title).map(fromOpenLibrary)).slice(0, 20);
}

/** One result per book: same base title + first author, keeping the first (most relevant) that has a cover. */
function dedupe(books: Book[]): Book[] {
  const byKey = new Map<string, Book>();
  for (const b of books) {
    const key = `${baseTitle(b.title)}|${norm(b.author.split(',')[0])}`;
    const prev = byKey.get(key);
    if (!prev || (!prev.coverUrl && b.coverUrl)) byKey.set(key, b);
  }
  return [...byKey.values()];
}

/** Description for a catalog book (Open Library keeps it on the work record). */
export async function fetchDescription(book: Book, signal?: AbortSignal): Promise<string | undefined> {
  if (book.source !== 'openlibrary') return undefined;
  const work = await getJson<{ description?: string | { value: string } }>(
    `${OL}/works/${book.id.replace('ol:', '')}.json`,
    signal,
  );
  const d = work.description;
  const text = typeof d === 'string' ? d : d?.value;
  // Strip Open Library's trailing source notes and markdown links.
  return text
    ?.split(/\n-{3,}|\n\n\(source|\r?\n\r?\n\[/i)[0]
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

// Cover lookups for books without one (e.g. the sample library), max 4 at a time.
let active = 0;
const waiting: (() => void)[] = [];
async function limited<T>(task: () => Promise<T>): Promise<T> {
  if (active >= 4) await new Promise<void>((r) => waiting.push(r));
  active++;
  try {
    return await task();
  } finally {
    active--;
    waiting.shift()?.();
  }
}

type CoverDoc = { title: string; author_name?: string[]; cover_i?: number; language?: string[] };

const coverUrl = (id: number) => `${OL_COVERS}/${id}-M.jpg`;

/** Title without series/edition suffixes: "Alas de sangre (Empíreo 1)" → "alas de sangre". */
function baseTitle(t: string) {
  return norm(t)
    .replace(/\s*[([].*$/, '')
    .split(/\s+\/\s+|:/)[0]
    .replace(/[^\p{L}\p{N} ]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Same book title, ignoring series and subtitles — but "Hábitos atómicos en acción" ≠ "Hábitos atómicos". */
function sameTitle(a: string, b: string) {
  return baseTitle(a) === baseTitle(b);
}

/** Prefer Spanish editions, then English; never other languages (no German cover in a Spanish shelf). */
function languageRank(d: CoverDoc) {
  if (!d.language?.length) return 2;
  if (d.language.includes('spa')) return 0;
  if (d.language.includes('eng')) return 1;
  return 9;
}

/**
 * Finds a real cover for a title + author, or undefined.
 * 1. Title + author search, accepting only the same title (series and
 *    subtitles ignored), Spanish editions first.
 * 2. Broad search, accepting the best Spanish/English work by the same author
 *    — this finds Spanish titles indexed under the original work.
 */
export function findCover(title: string, author: string): Promise<string | undefined> {
  const mainAuthor = author.split(/,| y | and /)[0].trim();
  const surname = norm(mainAuthor.split(' ').pop() ?? mainAuthor);
  const best = (docs: CoverDoc[]) =>
    docs.filter((d) => d.cover_i && languageRank(d) < 9).sort((a, b) => languageRank(a) - languageRank(b))[0];

  return limited(async () => {
    const byTitle = await getJson<{ docs: CoverDoc[] }>(
      `${OL}/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(mainAuthor)}&fields=title,cover_i,language&limit=10`,
    );
    const exact = best(byTitle.docs.filter((d) => sameTitle(d.title, title)));
    if (exact?.cover_i) return coverUrl(exact.cover_i);

    const broad = await getJson<{ docs: CoverDoc[] }>(
      `${OL}/search.json?q=${encodeURIComponent(`${title} ${mainAuthor}`)}&fields=title,author_name,cover_i,language&limit=5`,
    );
    const top = best(broad.docs.filter((d) => d.author_name?.some((a) => norm(a).includes(surname))));
    return top?.cover_i ? coverUrl(top.cover_i) : undefined;
  });
}

// ——— ISBN ———

/**
 * Normalises a scanned or typed code to an ISBN-13, or undefined if it isn't a
 * valid book code. Accepts EAN-13 starting with 978/979 and ISBN-10 (incl. "X").
 */
export function toIsbn13(raw: string): string | undefined {
  const code = raw.replace(/[^0-9Xx]/g, '').toUpperCase();
  if (code.length === 13 && /^97[89]\d{10}$/.test(code)) {
    const sum = [...code.slice(0, 12)].reduce((s, d, i) => s + Number(d) * (i % 2 ? 3 : 1), 0);
    return (10 - (sum % 10)) % 10 === Number(code[12]) ? code : undefined;
  }
  if (code.length === 10 && /^\d{9}[\dX]$/.test(code)) {
    const sum = [...code].reduce((s, c, i) => s + (c === 'X' ? 10 : Number(c)) * (10 - i), 0);
    if (sum % 11 !== 0) return undefined;
    const body = '978' + code.slice(0, 9);
    const check = (10 - ([...body].reduce((s, d, i) => s + Number(d) * (i % 2 ? 3 : 1), 0) % 10)) % 10;
    return body + check;
  }
  return undefined;
}

/**
 * Looks a book up by ISBN. The cover is the one of that exact edition (so a
 * Spanish paperback shows its Spanish cover), falling back to the work cover.
 */
export async function lookupIsbn(isbn13: string, signal?: AbortSignal): Promise<Book | undefined> {
  const data = await getJson<{ docs: OLDoc[] }>(`${OL}/search.json?isbn=${isbn13}&fields=${OL_FIELDS}&limit=1`, signal);
  const doc = data.docs[0];
  if (!doc) return undefined;
  const book = fromOpenLibrary(doc);
  const editionCover = `https://covers.openlibrary.org/b/isbn/${isbn13}-M.jpg?default=false`;
  if (book.coverUrl) book.coverFallbackUrl = book.coverUrl;
  book.coverUrl = editionCover;
  book.isbn = isbn13;
  return book;
}
