export function normalizeSearchTerm(value: string): string {
  return value.trim().toLowerCase();
}

export function includesKeyword(value: string | null | undefined, keyword: string): boolean {
  if (!keyword) {
    return true;
  }
  return (value || '').toLowerCase().includes(keyword);
}

export function matchesAnyKeyword(keyword: string, values: Array<string | null | undefined>): boolean {
  if (!keyword) {
    return true;
  }
  return values.some((value) => includesKeyword(value, keyword));
}
