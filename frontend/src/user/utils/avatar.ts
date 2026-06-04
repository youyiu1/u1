export function getFallbackAvatar(name?: string): string {
  const displayName = (name || '用户').trim() || '用户';
  const initials = getInitials(displayName);
  const palette = ['#ff385c', '#4a90e2', '#50c38e', '#ffb900', '#9b51e0', '#ff7d94'];
  const bg = palette[Math.abs(hashCode(displayName)) % palette.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
    <rect width="160" height="160" rx="24" fill="${bg}" />
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
      font-family="PingFang SC, Microsoft YaHei, Noto Sans SC, sans-serif"
      font-size="56" font-weight="700" fill="#ffffff">${escapeXml(initials)}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getInitials(name: string): string {
  const normalized = name.trim();
  if (!normalized) return '用户';
  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase();
  }
  return normalized.slice(0, 2);
}

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
