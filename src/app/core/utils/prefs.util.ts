import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Wrapper de Preferences con fallback a localStorage
 * para que funcione igual en web y en dispositivos nativos.
 */
export const Prefs = {
  async get(key: string): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      return (await Preferences.get({ key })).value ?? '';
    }
    return localStorage.getItem(key) ?? '';
  },

  async set(key: string, value: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key, value });
      return;
    }
    localStorage.setItem(key, value);
  },

  async remove(key: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key });
      return;
    }
    localStorage.removeItem(key);
  }
};