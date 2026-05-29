export function formatDateTime(
  value?: string | null,
  fallback = ''
): string {
  if (!value) return fallback;

  const normalized = value.replace('T', ' ').trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalized)) {
    return normalized.slice(0, 16);
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(normalized)) {
    return normalized;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return normalized || fallback;
  }

  const yyyy = parsed.getFullYear();
  const MM = String(parsed.getMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getDate()).padStart(2, '0');
  const hh = String(parsed.getHours()).padStart(2, '0');
  const mm = String(parsed.getMinutes()).padStart(2, '0');

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
}
