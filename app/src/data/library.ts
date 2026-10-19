import type { GenreId, MoodId } from './taxonomy';

export type ReadingStatus = 'read' | 'reading' | 'want' | 'dnf';

export type LibraryEntry = {
  bookId: string;
  status: ReadingStatus;
  /** 1–5, required for "read". */
  rating?: number;
  review?: string;
  /** ISO date the book was finished (or abandoned). */
  readAt?: string;
  /** 0–1, only for "reading". */
  progress?: number;
  addedAt: string;
};

export const STATUSES: ReadingStatus[] = ['read', 'reading', 'want', 'dnf'];

/** How much someone reads — asked during onboarding, used to suggest a yearly goal. */
export type ReadingPace = 'casual' | 'regular' | 'avid';

export const PACE_GOALS: Record<ReadingPace, number> = { casual: 12, regular: 30, avid: 60 };

export type Profile = {
  name: string;
  username: string;
  yearlyGoal: number;
  isPremium: boolean;
  freeRecommendationsUsed: number;
  /** Finished the welcome questionnaire (or chose to explore the demo). */
  onboarded: boolean;
  readingPace?: ReadingPace;
  /** Stated tastes from onboarding: a prior for recommendations before ratings exist. */
  favoriteGenres: GenreId[];
  favoriteMoods: MoodId[];
};

export const FREE_RECOMMENDATIONS_PER_MONTH = 3;

export const DEMO_PROFILE: Profile = {
  name: 'Lucía',
  username: 'lucialee',
  yearlyGoal: 24,
  isPremium: false,
  freeRecommendationsUsed: 1,
  onboarded: false,
  readingPace: 'regular',
  favoriteGenres: ['thriller', 'literary', 'fantasy'],
  favoriteMoods: ['unputdownable', 'heartbreak'],
};

/** Turns a display name into a handle: "Lucía Pérez" → "luciaperez". */
export function usernameFrom(name: string) {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20) || 'lector'
  );
}

/** Demo user's library — a realistic mix of genres, ratings and statuses. */
export const DEMO_LIBRARY: LibraryEntry[] = [
  { bookId: 'alas-sangre', status: 'reading', progress: 0.42, addedAt: '2026-10-02' },
  {
    bookId: 'sombra-viento',
    status: 'read',
    rating: 5,
    review: 'De esos libros que te hacen querer vivir en una librería.',
    readAt: '2026-09-21',
    addedAt: '2026-09-01',
  },
  {
    bookId: 'reina-roja',
    status: 'read',
    rating: 5,
    review: 'No pude parar. Antonia Scott es un personaje inolvidable.',
    readAt: '2026-08-30',
    addedAt: '2026-08-12',
  },
  {
    bookId: 'hail-mary',
    status: 'read',
    rating: 5,
    review: 'Ciencia, humor y una amistad preciosa.',
    readAt: '2026-08-04',
    addedAt: '2026-07-20',
  },
  {
    bookId: 'paciente-silenciosa',
    status: 'read',
    rating: 4,
    review: 'El giro final me dejó sin palabras.',
    readAt: '2026-07-15',
    addedAt: '2026-07-01',
  },
  {
    bookId: 'evelyn-hugo',
    status: 'read',
    rating: 5,
    review: 'Lloré en el avión. Sin más.',
    readAt: '2026-06-28',
    addedAt: '2026-06-10',
  },
  {
    bookId: 'habitos-atomicos',
    status: 'read',
    rating: 4,
    review: 'Práctico y fácil de aplicar.',
    readAt: '2026-06-02',
    addedAt: '2026-05-20',
  },
  { bookId: 'tres-cuerpos', status: 'read', rating: 4, readAt: '2026-05-12', addedAt: '2026-04-25' },
  {
    bookId: 'circe',
    status: 'read',
    rating: 5,
    review: 'Prosa preciosa. Quiero todo lo de Madeline Miller.',
    readAt: '2026-04-18',
    addedAt: '2026-04-01',
  },
  {
    bookId: 'chica-tren',
    status: 'read',
    rating: 3,
    review: 'Entretenido, pero lo vi venir.',
    readAt: '2026-03-27',
    addedAt: '2026-03-15',
  },
  { bookId: 'romper-circulo', status: 'read', rating: 4, readAt: '2026-03-09', addedAt: '2026-02-28' },
  { bookId: 'sapiens', status: 'read', rating: 4, readAt: '2026-02-20', addedAt: '2026-01-30' },
  { bookId: 'tokio-blues', status: 'read', rating: 4, readAt: '2026-01-25', addedAt: '2026-01-10' },
  { bookId: 'busca-sentido', status: 'read', rating: 5, readAt: '2026-01-08', addedAt: '2026-01-02' },
  { bookId: 'cien-anos', status: 'read', rating: 5, readAt: '2025-11-30', addedAt: '2025-11-01' },
  { bookId: 'nombre-viento', status: 'read', rating: 5, readAt: '2025-10-15', addedAt: '2025-09-20' },
  { bookId: 'rebeca', status: 'read', rating: 4, readAt: '2025-09-10', addedAt: '2025-08-25' },
  { bookId: 'infinito-junco', status: 'read', rating: 4, readAt: '2025-08-12', addedAt: '2025-07-20' },
  { bookId: 'patria', status: 'read', rating: 4, readAt: '2025-06-30', addedAt: '2025-06-01' },
  {
    bookId: 'poder-ahora',
    status: 'dnf',
    review: 'No conecté con el tono.',
    readAt: '2026-02-02',
    addedAt: '2026-01-28',
  },
  { bookId: 'dune', status: 'want', addedAt: '2026-09-25' },
  { bookId: 'loba-negra', status: 'want', addedAt: '2026-09-01' },
];
