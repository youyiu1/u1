import type { Item, Service } from '../types';

export function parseImages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  }
  if (typeof value !== 'string' || value.length === 0) {
    return [];
  }
  if (value.startsWith('[')) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string' && item.length > 0)
        : [];
    } catch {
      return [];
    }
  }
  return [value];
}

export function getPrimaryImage(...values: unknown[]): string {
  for (const value of values) {
    const images = parseImages(value);
    if (images[0]) {
      return images[0];
    }
  }
  return '';
}

export function getItemPrimaryImage(item: Pick<Item, 'images' | 'image'>): string {
  return getPrimaryImage(item.images, item.image);
}

export function getServicePrimaryImage(service: Pick<Service, 'images' | 'image'>): string {
  return getPrimaryImage(service.images, service.image);
}
