export type GenreId =
  | 'thriller'
  | 'mystery'
  | 'selfhelp'
  | 'drama'
  | 'fantasy'
  | 'romance'
  | 'scifi'
  | 'historical'
  | 'literary'
  | 'nonfiction'
  | 'horror';

export type MoodId = 'light' | 'heartbreak' | 'unputdownable' | 'learn' | 'escape' | 'dark';

export type Localized = { es: string; en: string };

export const GENRES: { id: GenreId; label: Localized; emoji: string }[] = [
  { id: 'thriller', label: { es: 'Thriller', en: 'Thriller' }, emoji: '🔪' },
  { id: 'mystery', label: { es: 'Misterio', en: 'Mystery' }, emoji: '🕯️' },
  { id: 'selfhelp', label: { es: 'Desarrollo personal', en: 'Self-growth' }, emoji: '🌱' },
  { id: 'drama', label: { es: 'Drama', en: 'Drama' }, emoji: '🎭' },
  { id: 'fantasy', label: { es: 'Fantasía', en: 'Fantasy' }, emoji: '🐉' },
  { id: 'romance', label: { es: 'Romance', en: 'Romance' }, emoji: '🌹' },
  { id: 'scifi', label: { es: 'Ciencia ficción', en: 'Sci-fi' }, emoji: '🪐' },
  { id: 'historical', label: { es: 'Histórica', en: 'Historical' }, emoji: '🏛️' },
  { id: 'literary', label: { es: 'Literaria', en: 'Literary' }, emoji: '🖋️' },
  { id: 'nonfiction', label: { es: 'No ficción', en: 'Non-fiction' }, emoji: '🧠' },
  { id: 'horror', label: { es: 'Terror', en: 'Horror' }, emoji: '🦇' },
];

export const MOODS: { id: MoodId; label: Localized; hint: Localized; emoji: string }[] = [
  {
    id: 'unputdownable',
    label: { es: 'Que no pueda soltarlo', en: "Can't put it down" },
    hint: { es: 'Ritmo alto, capítulos cortos', en: 'Fast pace, short chapters' },
    emoji: '⚡',
  },
  {
    id: 'heartbreak',
    label: { es: 'Que me rompa el corazón', en: 'Break my heart' },
    hint: { es: 'Emoción a flor de piel', en: 'All the feelings' },
    emoji: '💔',
  },
  {
    id: 'light',
    label: { es: 'Algo ligero', en: 'Something light' },
    hint: { es: 'Para desconectar sin esfuerzo', en: 'Easy, cosy, effortless' },
    emoji: '☁️',
  },
  {
    id: 'escape',
    label: { es: 'Evadirme a otro mundo', en: 'Escape to another world' },
    hint: { es: 'Mundos enormes y épicos', en: 'Big, epic worlds' },
    emoji: '🗺️',
  },
  {
    id: 'learn',
    label: { es: 'Aprender algo', en: 'Learn something' },
    hint: { es: 'Ideas que se quedan', en: 'Ideas that stick' },
    emoji: '💡',
  },
  {
    id: 'dark',
    label: { es: 'Algo oscuro', en: 'Something dark' },
    hint: { es: 'Atmósfera inquietante', en: 'Unsettling atmosphere' },
    emoji: '🌑',
  },
];

export function genreLabel(id: GenreId, locale: 'es' | 'en') {
  return GENRES.find((g) => g.id === id)?.label[locale] ?? id;
}

export function moodLabel(id: MoodId, locale: 'es' | 'en') {
  return MOODS.find((m) => m.id === id)?.label[locale] ?? id;
}

/** How a mood reads as a shared trait: "the same {trait}". */
export const MOOD_TRAITS: Record<MoodId, Localized> = {
  unputdownable: { es: 'ritmo trepidante', en: 'page-turning pace' },
  heartbreak: { es: 'carga emocional', en: 'emotional punch' },
  light: { es: 'tono ligero', en: 'light touch' },
  escape: { es: 'mundo en el que perderse', en: 'immersive world' },
  learn: { es: 'ideas que se quedan', en: 'ideas that stick' },
  dark: { es: 'atmósfera oscura', en: 'dark atmosphere' },
};
