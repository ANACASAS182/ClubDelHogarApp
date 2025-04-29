import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  private isInitialized = false;

  async init() {
    if (!this.isInitialized) {
      const storage = await this.storage.create();
      this._storage = storage;
      this.isInitialized = true;
    }
  }
  
  async saveToken(token: string): Promise<void> {
    await this._storage?.set('jwt-token', token);
  }

  async getToken(): Promise<string | null> {
    if (!this._storage) {
      await this.init();
    }
    return await this._storage?.get('jwt-token');
  }

  async removeToken(): Promise<void> {
    await this._storage?.remove('jwt-token');
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}