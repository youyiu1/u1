/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 获取浏览器当前位置
 * @returns Promise<{latitude: number, longitude: number} | null>
 */
export async function getCurrentLocation(): Promise<{latitude: number, longitude: number} | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => {
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  });
}