// src/app/core/utils/prefs.util.ts
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const hasNativePrefs =
  Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Preferences');

export const Prefs = {
  async get(key: string): Promise<string> {
    if (hasNativePrefs) {
      try {
        return (await Preferences.get({ key })).value ?? '';
      } catch (e) {
        // fallback silencioso
      }
    }
    return localStorage.getItem(key) ?? '';
  },

  async set(key: string, value: string): Promise<void> {
    if (hasNativePrefs) {
      try {
        await Preferences.set({ key, value });
        return;
      } catch (e) {
        // fallback silencioso
      }
    }
    localStorage.setItem(key, value);
  },

  async remove(key: string): Promise<void> {
    if (hasNativePrefs) {
      try {
        await Preferences.remove({ key });
        return;
      } catch (e) {
        // fallback silencioso
      }
    }
    localStorage.removeItem(key);
  }
};