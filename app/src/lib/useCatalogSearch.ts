import { useEffect, useState } from 'react';
import { registerBooks, type Book } from '@/data/books';
import { searchBooks } from './catalog';

export type SearchStatus = 'idle' | 'loading' | 'error';

/**
 * Debounced live-catalog search. Each response is stored together with the
 * query it answers, so results for an outdated query are never shown and no
 * state has to be reset synchronously when the query changes.
 */
export function useCatalogSearch(query: string, { minLength = 3, delay = 400, limit = 20 } = {}) {
  const q = query.trim();
  const active = q.length >= minLength;
  const [result, setResult] = useState<{ q: string; books: Book[]; error?: boolean }>();

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchBooks(q, controller.signal)
        .then((books) => {
          registerBooks(books);
          setResult({ q, books: books.slice(0, limit) });
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          console.warn('[Leora] catalog search failed', err);
          setResult({ q, books: [], error: true });
        });
    }, delay);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, active, delay, limit]);

  const current = active && result?.q === q ? result : undefined;
  const status: SearchStatus = !active ? 'idle' : !current ? 'loading' : current.error ? 'error' : 'idle';
  return { books: current?.books ?? [], status, active };
}
