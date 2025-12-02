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

      if (!tel) {
        console.log('[OnboardingGuard] sin cdh_tel, redirijo a /login');
        await this.router.navigate(['/login'], { replaceUrl: true });
        return false;
      }

      const resp = await firstValueFrom(
        this.usuarioService.getUsuarioLogeado(tel)
      );

      console.log('[OnboardingGuard] resp getUsuarioLogeado', resp);

      const user = resp?.data as Usuario | undefined;
      const mostrar = user?.mostrarOnboarding;

      console.log('[OnboardingGuard] mostrarOnboarding =', mostrar);

      const debeOnboard =
        mostrar === true ||
        mostrar === 1 ||
        mostrar === '1';

      // ✅ Si SÍ debe ver onboarding, lo dejamos entrar a /onboarding
      if (debeOnboard) {
        return true;
      }

      // ❌ Si NO debe verlo, lo mandamos al dashboard
      await this.router.navigate(['/dashboard/network'], { replaceUrl: true });
      return false;

    } catch (err) {
      console.error('[OnboardingGuard] error', err);
      // Ante error, mejor dejar pasar o redirigir al dashboard, pero sin bucles
      return true;
    }
  }
}