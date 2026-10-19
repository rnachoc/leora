import type { Book } from '@/data/books';

/**
 * "Get it" links for a book, with affiliate tracking when configured.
 *
 * Configuration (all optional, set in app/.env):
 * - EXPO_PUBLIC_AMAZON_TAG                Amazon Associates tag, e.g. "leora-21".
 * - EXPO_PUBLIC_AFFILIATE_CASADELLIBRO,
 *   EXPO_PUBLIC_AFFILIATE_FNAC,
 *   EXPO_PUBLIC_AFFILIATE_KOBO,
 *   EXPO_PUBLIC_AFFILIATE_AUDIBLE         Deep-link template from the affiliate
 *                                         network (Awin, etc.) containing {url},
 *                                         which is replaced by the encoded store URL.
 *
 * Without configuration the links work normally, just untracked.
 * When the ISBN is known, links search by ISBN (exact edition) instead of title.
 */

export type StoreId = 'amazon' | 'casadellibro' | 'fnac' | 'kobo' | 'audible';
export type StoreLink = { id: StoreId; label: string; url: string };

type Env = Partial<Record<string, string>>;

// Read each variable explicitly: Expo only inlines EXPO_PUBLIC_* when accessed by name.
const ENV: Env = {
  EXPO_PUBLIC_AMAZON_TAG: process.env.EXPO_PUBLIC_AMAZON_TAG,
  EXPO_PUBLIC_AFFILIATE_CASADELLIBRO: process.env.EXPO_PUBLIC_AFFILIATE_CASADELLIBRO,
  EXPO_PUBLIC_AFFILIATE_FNAC: process.env.EXPO_PUBLIC_AFFILIATE_FNAC,
  EXPO_PUBLIC_AFFILIATE_KOBO: process.env.EXPO_PUBLIC_AFFILIATE_KOBO,
  EXPO_PUBLIC_AFFILIATE_AUDIBLE: process.env.EXPO_PUBLIC_AFFILIATE_AUDIBLE,
};

/** ISBN-13 (978…) → ISBN-10, used by Amazon product URLs. */
export function isbn13to10(isbn13: string): string | undefined {
  if (!/^978\d{10}$/.test(isbn13)) return undefined;
  const body = isbn13.slice(3, 12);
  const sum = [...body].reduce((s, d, i) => s + Number(d) * (10 - i), 0);
  const check = (11 - (sum % 11)) % 11;
  return body + (check === 10 ? 'X' : String(check));
}

function withTemplate(url: string, template?: string) {
  return template && template.includes('{url}') ? template.replace('{url}', encodeURIComponent(url)) : url;
}

export function storeLinks(book: Pick<Book, 'title' | 'author' | 'isbn'>, env: Env = ENV): StoreLink[] {
  const query = encodeURIComponent(book.isbn ?? `${book.title} ${book.author}`);
  const isbn10 = book.isbn ? isbn13to10(book.isbn) : undefined;
  const tag = env.EXPO_PUBLIC_AMAZON_TAG;

  const amazonBase = isbn10 ? `https://www.amazon.es/dp/${isbn10}` : `https://www.amazon.es/s?k=${query}&i=stripbooks`;
  const amazon = tag
    ? `${amazonBase}${amazonBase.includes('?') ? '&' : '?'}tag=${encodeURIComponent(tag)}`
    : amazonBase;

  return [
    { id: 'amazon', label: 'Amazon', url: amazon },
    {
      id: 'casadellibro',
      label: 'Casa del Libro',
      url: withTemplate(
        `https://www.casadellibro.com/busqueda-generica?busqueda=${query}`,
        env.EXPO_PUBLIC_AFFILIATE_CASADELLIBRO,
      ),
    },
    {
      id: 'fnac',
      label: 'Fnac',
      url: withTemplate(
        `https://www.fnac.es/SearchResult/ResultList.aspx?Search=${query}`,
        env.EXPO_PUBLIC_AFFILIATE_FNAC,
      ),
    },
    {
      id: 'kobo',
      label: 'Kobo',
      url: withTemplate(`https://www.kobo.com/es/es/search?query=${query}`, env.EXPO_PUBLIC_AFFILIATE_KOBO),
    },
    {
      id: 'audible',
      label: 'Audible',
      url: withTemplate(`https://www.audible.es/search?keywords=${query}`, env.EXPO_PUBLIC_AFFILIATE_AUDIBLE),
    },
  ];
}
