import { User } from '../types';
import { readStorageJson, removeStorageValue, writeStorageJson } from './jsonStorage';

export const AUTH_USER_KEY = 'neighborhood_user';
export const AUTH_STATE_EVENT = 'neighborhood:auth-state-changed';

export function dispatchAuthStateChange(): void {
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
}

export function getStoredUser(): User | null {
  return readStorageJson<User | null>(localStorage, AUTH_USER_KEY, null);
}

export function setStoredUser(user: User): void {
  writeStorageJson(localStorage, AUTH_USER_KEY, user);
}

export function removeStoredUser(): void {
  if (!getStoredUser()) {
    return;
  }
  removeStorageValue(localStorage, AUTH_USER_KEY);
  dispatchAuthStateChange();
}
