/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 获取浏览器当前位置
 * @returns Promise<{latitude: number, longitude: number} | null>
 */
const LOCATION_CACHE_KEY = 'cached_location_v1';
const LOCATION_CACHE_TTL_MS = 5 * 60 * 1000;

type LocationPoint = { latitude: number; longitude: number };

function readCachedLocation(): LocationPoint | null {
  try {
    const raw = sessionStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { latitude: number; longitude: number; ts: number };
    if (!parsed || !parsed.ts) return null;
    if (Date.now() - parsed.ts > LOCATION_CACHE_TTL_MS) return null;
    return { latitude: parsed.latitude, longitude: parsed.longitude };
  } catch {
    return null;
  }
}

function writeCachedLocation(location: LocationPoint) {
  try {
    sessionStorage.setItem(
      LOCATION_CACHE_KEY,
      JSON.stringify({ ...location, ts: Date.now() })
    );
  } catch {
  }
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
