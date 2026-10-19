/**
 * Leora design tokens — "night library": warm near-black surfaces,
 * parchment text and an aged-gold accent. Book covers bring the colour.
 */
export const colors = {
  bg: '#0E0C0A',
  bgElevated: '#15120E',
  surface: '#1B1712',
  surfaceHigh: '#241F18',
  border: 'rgba(243, 235, 221, 0.08)',
  borderStrong: 'rgba(243, 235, 221, 0.16)',

  text: '#F3EBDD',
  textMuted: '#A99D8B',
  textFaint: '#6E6457',

  gold: '#C9A46A',
  goldBright: '#E3C38C',
  goldDim: 'rgba(201, 164, 106, 0.16)',

  wood: '#2A2017',
  woodEdge: '#3A2C1F',
  woodShadow: '#120D09',

  success: '#8FB996',
  danger: '#D98473',
  overlay: 'rgba(8, 6, 4, 0.72)',
} as const;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_400Regular_Italic',
  displayRegular: 'Fraunces_400Regular',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, color: colors.text },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, color: colors.text },
  heading: { fontFamily: fonts.display, fontSize: 19, lineHeight: 25, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.text },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
} as const;

/** Darken or lighten a hex colour by a factor (-1..1). */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const ch = (v: number) =>
    Math.max(0, Math.min(255, Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount)));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
