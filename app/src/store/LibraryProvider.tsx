import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { getBook, type Book } from '@/data/books';
import {
  DEMO_LIBRARY,
  DEMO_PROFILE,
  FREE_RECOMMENDATIONS_PER_MONTH,
  type LibraryEntry,
  type Profile,
  type ReadingStatus,
} from '@/data/library';

type State = { entries: LibraryEntry[]; profile: Profile };

type Action =
  | { type: 'add'; bookId: string; status: ReadingStatus; rating?: number }
  | { type: 'update'; bookId: string; patch: Partial<Omit<LibraryEntry, 'bookId'>> }
  | { type: 'remove'; bookId: string }
  | { type: 'useRecommendation' }
  | { type: 'setPremium'; value: boolean };

const today = () => new Date().toISOString().slice(0, 10);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      if (state.entries.some((e) => e.bookId === action.bookId)) return state;
      const entry: LibraryEntry = {
        bookId: action.bookId,
        status: action.status,
        rating: action.rating,
        addedAt: today(),
        readAt: action.status === 'read' ? today() : undefined,
        progress: action.status === 'reading' ? 0 : undefined,
      };
      return { ...state, entries: [entry, ...state.entries] };
    }
    case 'update':
      return {
        ...state,
        entries: state.entries.map((e) => {
          if (e.bookId !== action.bookId) return e;
          const next = { ...e, ...action.patch };
          if (action.patch.status === 'read' && !next.readAt) next.readAt = today();
          return next;
        }),
      };
    case 'remove':
      return { ...state, entries: state.entries.filter((e) => e.bookId !== action.bookId) };
    case 'useRecommendation':
      return {
        ...state,
        profile: { ...state.profile, freeRecommendationsUsed: state.profile.freeRecommendationsUsed + 1 },
      };
    case 'setPremium':
      return { ...state, profile: { ...state.profile, isPremium: action.value } };
  }
}

export type ShelfItem = { entry: LibraryEntry; book: Book };

type LibraryValue = State & {
  items: ShelfItem[];
  entryFor: (bookId: string) => LibraryEntry | undefined;
  recommendationsLeft: number;
  canRecommend: boolean;
  dispatch: React.Dispatch<Action>;
};

const LibraryContext = createContext<LibraryValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { entries: DEMO_LIBRARY, profile: DEMO_PROFILE });

  const value = useMemo<LibraryValue>(() => {
    const items = state.entries
      .map((entry) => ({ entry, book: getBook(entry.bookId) }))
      .filter((i): i is ShelfItem => Boolean(i.book));
    const left = Math.max(0, FREE_RECOMMENDATIONS_PER_MONTH - state.profile.freeRecommendationsUsed);
    return {
      ...state,
      items,
      entryFor: (id) => state.entries.find((e) => e.bookId === id),
      recommendationsLeft: left,
      canRecommend: state.profile.isPremium || left > 0,
      dispatch,
    };
  }, [state]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider');
  return ctx;
}
