import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private tokenService: TokenService, private toastController: ToastController, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const token = await this.tokenService.getToken();

    if (!token) {
      await this.showToast('Debes iniciar sesión');
      this.router.navigate(['/login']);
      return false;
    }

    const payload = this.decodePayload(token);
    const isExpired = !payload || this.isTokenExpired(payload.exp);

    if (isExpired) {
      await this.showToast('Tu sesión ha expirado, vuelve a iniciar sesión.');
      await this.tokenService.removeToken();
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }

  private decodePayload(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  private isTokenExpired(exp: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    toast.present();
  }
}