import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { STRINGS, type Locale, type StringKey } from './strings';

type Vars = Record<string, string | number>;

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: StringKey, vars?: Vars) => string;
  formatDate: (iso: string) => string;
  formatNumber: (n: number) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('es');

  const t = useCallback(
    (key: StringKey, vars?: Vars) => {
      let s = STRINGS[locale][key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
      return s;
    },
    [locale],
  );

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t,
      formatDate: (iso) =>
        new Date(iso + 'T12:00:00').toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      formatNumber: (n) => n.toLocaleString(locale === 'es' ? 'es-ES' : 'en-GB'),
    }),
    [locale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
