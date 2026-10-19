import { describe, it, expect } from '@jest/globals';
import { isbn13to10, storeLinks } from '@/lib/stores';

const shadow = { title: 'La sombra del viento', author: 'Carlos Ruiz Zafón', isbn: '9788408163350' };

describe('isbn13to10', () => {
  it('converts 978 ISBNs and computes the check digit', () => {
    expect(isbn13to10('9788408163350')).toBe('8408163353');
    expect(isbn13to10('9780804429573')).toBe('080442957X');
  });
  it('has no ISBN-10 for 979 ISBNs', () => {
    expect(isbn13to10('9791032305690')).toBeUndefined();
  });
});

describe('storeLinks', () => {
  it('works without any affiliate configuration', () => {
    const links = storeLinks({ title: 'Dune', author: 'Frank Herbert' }, {});
    expect(links.map((l) => l.id)).toEqual(['amazon', 'casadellibro', 'fnac', 'kobo', 'audible']);
    expect(links[0].url).toBe('https://www.amazon.es/s?k=Dune%20Frank%20Herbert&i=stripbooks');
  });

  it('links Amazon to the product page with the Associates tag when the ISBN is known', () => {
    const [amazon] = storeLinks(shadow, { EXPO_PUBLIC_AMAZON_TAG: 'leora-21' });
    expect(amazon.url).toBe('https://www.amazon.es/dp/8408163353?tag=leora-21');
  });

  it('adds the tag to Amazon search links too', () => {
    const [amazon] = storeLinks({ title: 'Dune', author: 'Frank Herbert' }, { EXPO_PUBLIC_AMAZON_TAG: 'leora-21' });
    expect(amazon.url).toMatch(/&tag=leora-21$/);
  });

  it('wraps other stores in the affiliate deep-link template and searches by ISBN', () => {
    const links = storeLinks(shadow, {
      EXPO_PUBLIC_AFFILIATE_FNAC: 'https://www.awin1.com/cread.php?awinmid=1&awinaffid=2&ued={url}',
    });
    const fnac = links.find((l) => l.id === 'fnac')!;
    expect(fnac.url).toBe(
      'https://www.awin1.com/cread.php?awinmid=1&awinaffid=2&ued=' +
        encodeURIComponent('https://www.fnac.es/SearchResult/ResultList.aspx?Search=9788408163350'),
    );
    expect(links.find((l) => l.id === 'kobo')!.url).toContain('query=9788408163350');
  });

  it('ignores a template without {url}', () => {
    const links = storeLinks(shadow, { EXPO_PUBLIC_AFFILIATE_KOBO: 'https://example.com/broken' });
    expect(links.find((l) => l.id === 'kobo')!.url).toBe('https://www.kobo.com/es/es/search?query=9788408163350');
  });
});
