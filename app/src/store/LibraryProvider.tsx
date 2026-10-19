import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { getBook, registerBooks, type Book } from '@/data/books';
import {
  DEMO_LIBRARY,
  DEMO_PROFILE,
  FREE_RECOMMENDATIONS_PER_MONTH,
  usernameFrom,
  type LibraryEntry,
  type Profile,
  type ReadingPace,
  type ReadingStatus,
} from '@/data/library';
import type { GenreId, MoodId } from '@/data/taxonomy';

/** Everything the welcome questionnaire collects. */
export type OnboardingAnswers = {
  name: string;
  readingPace: ReadingPace;
  favoriteGenres: GenreId[];
  favoriteMoods: MoodId[];
  favoriteBookIds: string[];
  yearlyGoal: number;
};

export type DismissReason = 'read' | 'notForMe' | 'tooLong' | 'author';
export type Dismissal = { bookId: string; reason: DismissReason };

type State = { entries: LibraryEntry[]; profile: Profile; dismissed: Dismissal[] };

type Action =
  | { type: 'add'; bookId: string; status: ReadingStatus; rating?: number }
  | { type: 'update'; bookId: string; patch: Partial<Omit<LibraryEntry, 'bookId'>> }
  | { type: 'remove'; bookId: string }
  | { type: 'useRecommendation' }
  | { type: 'dismiss'; bookId: string; reason: DismissReason }
  | { type: 'setPremium'; value: boolean }
  | { type: 'hydrate'; state: State }
  | { type: 'reset' }
  | { type: 'startDemo' }
  | { type: 'completeOnboarding'; answers: OnboardingAnswers };

const DEMO_STATE: State = { entries: DEMO_LIBRARY, profile: DEMO_PROFILE, dismissed: [] };

/** Bump the version when the stored shape changes incompatibly. */
const STORAGE_KEY = 'leora:library:v1';
type Stored = State & { books: Book[] };

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
          // Starting a book again (or for the first time) begins its progress at 0.
          if (action.patch.status === 'reading' && next.progress == null) next.progress = 0;
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
    case 'dismiss':
      return { ...state, dismissed: [...state.dismissed, { bookId: action.bookId, reason: action.reason }] };
    case 'setPremium':
      return { ...state, profile: { ...state.profile, isPremium: action.value } };
    case 'hydrate':
      return action.state;
    case 'reset':
      return DEMO_STATE;
    case 'startDemo':
      return { ...DEMO_STATE, profile: { ...DEMO_PROFILE, onboarded: true } };
    case 'completeOnboarding': {
      // A fresh library: the books they loved, rated 5★. No read date, so they
      // don't count towards this year's goal.
      const a = action.answers;
      return {
        entries: a.favoriteBookIds.map((bookId) => ({ bookId, status: 'read' as const, rating: 5, addedAt: today() })),
        dismissed: [],
        profile: {
          name: a.name.trim(),
          username: usernameFrom(a.name),
          yearlyGoal: a.yearlyGoal,
          isPremium: false,
          freeRecommendationsUsed: 0,
          onboarded: true,
          readingPace: a.readingPace,
          favoriteGenres: a.favoriteGenres,
          favoriteMoods: a.favoriteMoods,
        },
      };
    }
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

/**
 * Library state, persisted on the device (AsyncStorage → localStorage on web).
 * First launch starts from the demo library; afterwards the reader's own data
 * is restored. Production will sync the same state to Supabase.
 */
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEMO_STATE);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Restore saved state once.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Stored;
        registerBooks(saved.books ?? []);
        dispatch({
          type: 'hydrate',
          state: {
            entries: saved.entries,
            profile: { ...DEMO_PROFILE, ...saved.profile },
            dismissed: saved.dismissed ?? [],
          },
        });
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  // Save after every change (debounced), including the live-catalog books the library references.
  useEffect(() => {
    if (!hydrated) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const books = state.entries
        .map((e) => getBook(e.bookId))
        .filter((b): b is Book => Boolean(b && b.source && b.source !== 'sample'));
      const stored: Stored = { ...state, books };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored)).catch(() => {});
    }, 300);
  }, [state, hydrated]);

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

  // Avoid flashing the demo library before saved data is restored.
  if (!hydrated) return null;

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider');
  return ctx;
}
