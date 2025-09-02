// src/app/core/utils/prefs.storage.ts
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class PrefsStorage {
  private ready: Promise<void>;
  constructor(private storage: Storage) { this.ready = this.storage.create().then(() => {}); }
  async get(k: string)     { await this.ready; return (await this.storage.get(k)) ?? ''; }
  async set(k: string, v: string) { await this.ready; return this.storage.set(k, v); }
  async remove(k: string)  { await this.ready; return this.storage.remove(k); }
}