import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { jsonResponse } from './helpers';
import { classify, lookupIsbn, searchBooks, toIsbn13 } from '@/lib/catalog';

describe('toIsbn13', () => {
  it('accepts a valid ISBN-13, with or without hyphens', () => {
    expect(toIsbn13('9788408163350')).toBe('9788408163350');
    expect(toIsbn13('978-84-08-16335-0')).toBe('9788408163350');
  });

  it('converts a valid ISBN-10 (including a trailing X) to ISBN-13', () => {
    expect(toIsbn13('8408163353')).toBe('9788408163350');
    expect(toIsbn13('0306406152')).toBe('9780306406157');
    expect(toIsbn13('080442957X')).toBe('9780804429573');
  });

  it('rejects wrong check digits and barcodes that are not books', () => {
    expect(toIsbn13('9788408163351')).toBeUndefined();
    expect(toIsbn13('8408163354')).toBeUndefined();
    expect(toIsbn13('4006381333931')).toBeUndefined(); // a grocery EAN-13
    expect(toIsbn13('12345')).toBeUndefined();
  });
});

describe('classify', () => {
  it('maps catalog subjects to Leora genres and moods', () => {
    const r = classify(['Detective and mystery stories', 'Fiction, thrillers, suspense', 'Literary fiction']);
    expect(r.genres).toEqual(expect.arrayContaining(['thriller', 'mystery']));
    expect(r.moods).toContain('unputdownable');
  });

  it('does not treat science fiction as non-fiction', () => {
    expect(classify(['Science fiction', 'Space flight']).genres).toEqual(['scifi']);
  });

  it('understands Spanish subjects', () => {
    expect(classify(['Autoayuda', 'Hábitos']).genres).toContain('selfhelp');
  });

  it('falls back to literary for plain fiction and returns nothing for unknown subjects', () => {
    expect(classify(['Fiction']).genres).toEqual(['literary']);
    expect(classify(['Cooking']).genres).toEqual([]);
  });
});

describe('catalog requests', () => {
  const fetchMock = jest.fn<typeof fetch>();
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it('returns one search result per book, preferring a record with a cover', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        docs: [
          { key: '/works/OL1W', title: 'El Principito', author_name: ['Antoine de Saint-Exupéry'] },
          { key: '/works/OL2W', title: 'El principito', author_name: ['Antoine de Saint-Exupéry'], cover_i: 42 },
          { key: '/works/OL3W', title: 'Le petit prince', author_name: ['Antoine de Saint-Exupéry'], cover_i: 7 },
        ],
      }),
    );
    const books = await searchBooks('el principito');
    expect(books).toHaveLength(2);
    expect(books[0]).toMatchObject({ id: 'ol:OL2W', coverUrl: 'https://covers.openlibrary.org/b/id/42-M.jpg' });
    expect(books[1].title).toBe('Le petit prince');
  });

  it('looks an ISBN up and prefers that edition’s cover, keeping the work cover as fallback', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        docs: [
          {
            key: '/works/OL278437W',
            title: 'La sombra del viento',
            author_name: ['Carlos Ruiz Zafón'],
            cover_i: 10107644,
          },
        ],
      }),
    );
    const book = await lookupIsbn('9788408163350');
    expect(fetchMock.mock.calls[0][0]).toContain('isbn=9788408163350');
    expect(book).toMatchObject({
      title: 'La sombra del viento',
      isbn: '9788408163350',
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9788408163350-M.jpg?default=false',
      coverFallbackUrl: 'https://covers.openlibrary.org/b/id/10107644-M.jpg',
    });
  });

  it('returns undefined for an unknown ISBN and throws on HTTP errors', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ docs: [] }));
    await expect(lookupIsbn('9780000000002')).resolves.toBeUndefined();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 503));
    await expect(searchBooks('dune')).rejects.toThrow('503');
  });
});
