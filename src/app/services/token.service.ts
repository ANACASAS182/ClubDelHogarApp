import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private _storage: Storage | null = null;
  private isInitialized = false;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    if (!this.isInitialized) {
      const storage = await this.storage.create();
      this._storage = storage;
      this.isInitialized = true;
    }
  }

  private async ensureReady() {
    if (!this.isInitialized) await this.init();
  }

  async saveToken(token: string): Promise<void> {
    await this.ensureReady();
    await this._storage!.set('jwt-token', token);
  }

  async getToken(): Promise<string | null> {
    await this.ensureReady();
    return await this._storage!.get('jwt-token');
  }

  async removeToken(): Promise<void> {
    await this.ensureReady();
    await this._storage!.remove('jwt-token');
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
} 