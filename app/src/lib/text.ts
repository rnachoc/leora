/** Lower-case and strip accents, so "Zafón" matches "zafon". */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
