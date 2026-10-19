import type { Book } from '@/data/books';
import type { GenreId, MoodId } from '@/data/taxonomy';

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

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

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
  const data = await getJson<{ docs: OLDoc[] }>(`${OL}/search.json?q=${q}&fields=${OL_FIELDS}&limit=20`, signal);
  return data.docs.filter((d) => d.title).map(fromOpenLibrary);
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

/** Finds a real cover for a title + author, or undefined. */
export function findCover(title: string, author: string): Promise<string | undefined> {
  return limited(async () => {
    const url = `${OL}/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(
      author.split(/,| y | and /)[0],
    )}&fields=cover_i&limit=5`;
    const data = await getJson<{ docs: { cover_i?: number }[] }>(url);
    const hit = data.docs.find((d) => d.cover_i);
    return hit ? `${OL_COVERS}/${hit.cover_i}-M.jpg` : undefined;
  });
}
