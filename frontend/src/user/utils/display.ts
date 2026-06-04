export const DEFAULT_CURRENCY_PREFIX = '￥';

export function formatCurrency(value?: number | string | null, prefix = DEFAULT_CURRENCY_PREFIX): string {
  if (value === null || value === undefined || value === '') {
    return `${prefix}0`;
  }

  const amount = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(amount)) {
    return `${prefix}0`;
  }

  return `${prefix}${amount}`;
}

export function fallbackText(value: string | null | undefined, fallback: string): string {
  return value && value.trim() ? value : fallback;
}
