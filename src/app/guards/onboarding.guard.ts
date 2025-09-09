// src/app/guards/onboarding.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UsuarioService } from '../services/api.back.services/usuario.service';
import { TokenService } from '../services/token.service';

interface GenericResponseDTO<T> { success: boolean; data: T; message?: string; }
interface Usuario { mostrarOnboarding?: boolean | null; }

@Injectable({ providedIn: 'root' })
export class OnboardingGuard implements CanActivate {
  constructor(
    private usuarioService: UsuarioService,
    private tokenService: TokenService,
    private router: Router
  ) {}

 // onboarding.guard.ts (cámbialo así)
async canActivate(): Promise<boolean> {
  try {
    const token = await this.tokenService.getToken();
    if (!token) return true; // AuthGuard corre antes; aquí no redirigimos

    const resp = await firstValueFrom(this.usuarioService.getUsuarioLogeado(true));
    const user = resp?.data as Usuario | undefined;

    if (user?.mostrarOnboarding) {
      await this.router.navigate(['/onboarding']);
      return false;
    }
    return true;
  } catch {
    // NO redirigir aquí; deja que AuthGuard maneje exp/ausencia de token
    return true;
  }
}
}