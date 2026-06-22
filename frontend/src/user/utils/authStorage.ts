import { User } from '../types';
import { readStorageJson, removeStorageValue, writeStorageJson } from './jsonStorage';

export const AUTH_USER_KEY = 'neighborhood_user';
export const AUTH_STATE_EVENT = 'neighborhood:auth-state-changed';

export function dispatchAuthStateChange(): void {
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
}

export function getStoredUser(): User | null {
  const sessionUser = readStorageJson<User | null>(sessionStorage, AUTH_USER_KEY, null);
  if (sessionUser) {
    return sessionUser;
  }
  const legacyUser = readStorageJson<User | null>(localStorage, AUTH_USER_KEY, null);
  if (legacyUser) {
    writeStorageJson(sessionStorage, AUTH_USER_KEY, legacyUser);
    removeStorageValue(localStorage, AUTH_USER_KEY);
    return legacyUser;
  }
  return null;
}

export function setStoredUser(user: User): void {
  writeStorageJson(sessionStorage, AUTH_USER_KEY, user);
  removeStorageValue(localStorage, AUTH_USER_KEY);
}

export function removeStoredUser(): void {
  if (!getStoredUser()) {
    return;
  }
  removeStorageValue(sessionStorage, AUTH_USER_KEY);
  removeStorageValue(localStorage, AUTH_USER_KEY);
  dispatchAuthStateChange();
}
