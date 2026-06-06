function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePath(pathname: string): string {
  if (!pathname) {
    return '/';
  }

  return pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname;
}

export function matchPathByRegex(pathname: string, pattern: RegExp): boolean {
  return pattern.test(normalizePath(pathname));
}

export function createSectionPathRegex(basePath: string): RegExp {
  const normalizedBasePath = normalizePath(basePath);

  if (normalizedBasePath === '/') {
    return /^\/$/;
  }

  return new RegExp(`^${escapeRegExp(normalizedBasePath)}(?:\/[^/]+)*$`);
}

export const PROFILE_DETAIL_PATH_REGEX = /^\/profile\/[^/]+$/;
