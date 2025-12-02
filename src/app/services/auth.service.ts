import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from './token.service';

// Ajusta esto al tipo real que regresa tu backend
export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    telefono?: string;
    mostrarOnboarding?: number;
    // ...cualquier otro campo
  };
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private tokenService: TokenService,
    private router: Router,
  ) {}

  // Se llama cuando el login fue exitoso
  async setSession(resp: LoginResponse) {
    const token = resp.data?.token;

    if (token) {
      await this.tokenService.saveToken(token);
    }

    if (resp.data?.telefono) {
      localStorage.setItem('cdh_tel', resp.data.telefono);
    }

    if (resp.data?.mostrarOnboarding !== undefined && resp.data?.mostrarOnboarding !== null) {
      localStorage.setItem('cdh_mostrarOnboarding', String(resp.data.mostrarOnboarding));
    }
  }

  async logout() {
    await this.tokenService.removeToken();
    localStorage.removeItem('cdh_tel');
    localStorage.removeItem('cdh_mostrarOnboarding');
    this.router.navigate(['/login']);
  }
}