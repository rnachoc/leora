import { STRINGS, type StringKey } from '@/i18n/strings';

/** Same interpolation as the app's i18n provider, for a fixed locale. */
export function makeT(locale: 'es' | 'en' = 'es') {
  return (key: StringKey, vars?: Record<string, string | number>) => {
    let s = STRINGS[locale][key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    return s;
  };
}

/** Minimal fetch Response stand-in. */
export function jsonResponse(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
}
