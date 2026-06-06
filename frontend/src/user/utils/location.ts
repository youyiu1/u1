/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { readStorageJson, writeStorageJson } from './jsonStorage';

/**
 * 获取浏览器当前位置。
 * @returns Promise<{ latitude: number, longitude: number } | null>
 */
const LOCATION_CACHE_KEY = 'cached_location_v1';
const LOCATION_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type LocationPoint = { latitude: number; longitude: number };

export function readCachedLocation(): LocationPoint | null {
  const parsed = readStorageJson<{ latitude: number; longitude: number; ts: number } | null>(
    sessionStorage,
    LOCATION_CACHE_KEY,
    null
  );
  if (!parsed?.ts) return null;
  if (Date.now() - parsed.ts > LOCATION_CACHE_TTL_MS) return null;
  return { latitude: parsed.latitude, longitude: parsed.longitude };
}

function writeCachedLocation(location: LocationPoint) {
  writeStorageJson(sessionStorage, LOCATION_CACHE_KEY, { ...location, ts: Date.now() });
}

export async function getCurrentLocation(maxWaitMs = 1800): Promise<LocationPoint | null> {
  const cached = readCachedLocation();
  if (cached) return cached;

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    let settled = false;
    const done = (value: LocationPoint | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const timer = setTimeout(() => done(null), maxWaitMs);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timer);
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        writeCachedLocation(location);
        done(location);
      },
      () => {
        clearTimeout(timer);
        done(null);
      },
      { enableHighAccuracy: false, timeout: maxWaitMs }
    );
  });
}

export async function getGeolocationPermissionState(): Promise<PermissionState | 'unsupported'> {
  if (!navigator.permissions?.query) return 'unsupported';
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return result.state;
  } catch {
    return 'unsupported';
  }
}
