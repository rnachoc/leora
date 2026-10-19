import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import type { Book } from '@/data/books';
import { findCover } from './catalog';

/**
 * Real-cover resolution for books that don't carry a coverUrl (e.g. the
 * bundled sample library). Results — including "no cover found" — are cached
 * in memory and on the device, so each book is looked up only once.
 */

// Bump when matching changes so earlier cached results are discarded.
const STORAGE_KEY = 'leora:covers:v3';
const cache = new Map<string, string | null>();
const inFlight = new Map<string, Promise<string | null>>();
let loaded: Promise<void> | null = null;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

function load() {
  loaded ??= AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => {
      if (!raw) return;
      for (const [id, url] of Object.entries(JSON.parse(raw) as Record<string, string | null>)) cache.set(id, url);
    })
    .catch(() => {});
  return loaded;
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(cache))).catch(() => {});
  }, 800);
}

async function resolve(book: Book): Promise<string | null> {
  await load();
  if (cache.has(book.id)) return cache.get(book.id) ?? null;
  let p = inFlight.get(book.id);
  if (!p) {
    p = findCover(book.title, book.author)
      .then((url) => {
        cache.set(book.id, url ?? null);
        scheduleSave();
        return url ?? null;
      })
      // Network errors are not cached: we'll retry next time.
      .catch(() => null)
      .finally(() => inFlight.delete(book.id));
    inFlight.set(book.id, p);
  }
  return p;
}

/** The best cover URL available for a book, or undefined while unknown / when there is none. */
export function useCoverUrl(book: Book): string | undefined {
  const [url, setUrl] = useState<string | undefined>(() => book.coverUrl ?? cache.get(book.id) ?? undefined);

  useEffect(() => {
    if (book.coverUrl) {
      setUrl(book.coverUrl);
      return;
    }
    let alive = true;
    resolve(book).then((u) => alive && setUrl(u ?? undefined));
    return () => {
      alive = false;
    };
  }, [book]);

  return url;
}

/** Forget cached lookups (used when resetting the demo). */
export async function clearCoverCache() {
  cache.clear();
  await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
}
