/**
 * Today's date as YYYY-MM-DD in the reader's local time zone.
 * (toISOString() is UTC: after 22:00 in Spain it already returns tomorrow,
 * and before 02:00 it still returns yesterday.)
 */
export function localToday(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
