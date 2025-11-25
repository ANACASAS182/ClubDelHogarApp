// src/app/guards/onboarding.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UsuarioService } from '../services/api.back.services/usuario.service';

interface Usuario {
  mostrarOnboarding?: boolean | number | string | null;
}

@Injectable({ providedIn: 'root' })
export class OnboardingGuard implements CanActivate {
  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  async canActivate(): Promise<boolean> {
    try {
      const tel = localStorage.getItem('cdh_tel');

      // Si no hay teléfono guardado → no hacemos nada especial
      if (!tel) {
        console.log('[OnboardingGuard] sin cdh_tel, dejo pasar');
        return true;
      }

      // Llamamos usando el teléfono (el service ya arma ?tel= y lo normaliza el back)
      const resp = await firstValueFrom(
        this.usuarioService.getUsuarioLogeado(tel)   // 👈 importante: le pasamos el tel
      );

      console.log('[OnboardingGuard] resp getUsuarioLogeado', resp);

      const user = resp?.data as Usuario | undefined;
      const mostrar = user?.mostrarOnboarding;

      console.log('[OnboardingGuard] mostrarOnboarding =', mostrar);

      const debeOnboard =
        mostrar === true ||
        mostrar === 1 ||
        mostrar === '1';

      if (debeOnboard) {
        await this.router.navigate(['/onboarding']);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[OnboardingGuard] error', err);
      // Si truena, mejor no bloquear la navegación
      return true;
    }
  }
}