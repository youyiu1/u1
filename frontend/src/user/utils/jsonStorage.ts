export function readStorageValue(storage: Storage | null | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStorageValue(storage: Storage | null | undefined, key: string, value: string): void {
  try {
    storage?.setItem(key, value);
  } catch {
    // ignore storage write failures
  }
}

export function removeStorageValue(storage: Storage | null | undefined, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    // ignore storage remove failures
  }
}

export function removeStorageItems(storage: Storage | null | undefined, keys: readonly string[]): void {
  keys.forEach((key) => removeStorageValue(storage, key));
}

export function readStorageJson<T>(storage: Storage | null | undefined, key: string, fallback: T): T {
  try {
    const raw = readStorageValue(storage, key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorageJson(storage: Storage | null | undefined, key: string, value: unknown): void {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage write failures
  }
}

export function readJson<T>(key: string, fallback: T): T {
  return readStorageJson(localStorage, key, fallback);
}

export function writeJson(key: string, value: unknown): void {
  writeStorageJson(localStorage, key, value);
}
