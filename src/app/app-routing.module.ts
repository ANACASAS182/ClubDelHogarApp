// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { UsuarioRegistroResolver } from './resolvers/usuario.registro.resolver';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AuthGuard } from './guards/auth.guard';
import { OnboardingGuard } from './guards/onboarding.guard';
import { OnboardingComponent } from './modals/onboarding/onboarding.component';

const routes: Routes = [
  // Arranque: directo al network
  { path: '', redirectTo: 'dashboard/network', pathMatch: 'full' },

  // LOGIN
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then(m => m.LoginPageModule),
    canActivate: [NoAuthGuard],   // <– solo entra si NO está logueado
  },

  // REGISTRO
  {
    path: 'registro',
    loadChildren: () =>
      import('./pages/usuario.registro/usuario.registro.module')
        .then(m => m.UsuarioRegistroPageModule),
    resolve: { resolverData: UsuarioRegistroResolver },
    canActivate: [NoAuthGuard],
  },
  {
    path: 'registro/:codigo',
    loadChildren: () =>
      import('./pages/usuario.registro/usuario.registro.module')
        .then(m => m.UsuarioRegistroPageModule),
    resolve: { resolverData: UsuarioRegistroResolver },
    canActivate: [NoAuthGuard],
  },

  // PASSWORD (normalmente también sin sesión)
  {
    path: 'password/recovery',
    loadChildren: () =>
      import('./pages/usuario.password.recovery/usuario.password.recovery.module')
        .then(m => m.UsuarioPasswordRecoveryPageModule),
    canActivate: [NoAuthGuard],
  },
  {
    path: 'password/reset',
    loadChildren: () =>
      import('./pages/usuario.password.reset/usuario.password.reset.module')
        .then(m => m.UsuarioPasswordResetPageModule),
    canActivate: [NoAuthGuard],
  },

  // ONBOARDING (aquí ya decide tu lógica, pero normalmente con sesión)
  {
    path: 'onboarding',
    component: OnboardingComponent,
    canActivate: [AuthGuard, OnboardingGuard],
  },

  // DASHBOARD (⚠️ SIN GUARDS)
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule),
    // ❌ quita esto:
    // canActivate: [NoAuthGuard],
    // runGuardsAndResolvers: 'always'
  },

  // ACTIVACIONES (igual, requiere sesión)
  {
    path: 'activaciones',
    loadChildren: () =>
      import('./pages/activaciones/activaciones.module').then(m => m.ActivacionesPageModule),
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },

  // Otras rutas
  {
    path: 'dashboard/referencias-app',
    loadChildren: () =>
      import('./pages/referencias-app/referencias-app.module').then(m => m.ReferenciasAppModule),
    canActivate: [AuthGuard],
  },

  {
    path: 'validar-codigo',
    loadChildren: () =>
      import('./pages/usuario.codigo.validar/usuario.codigo.validar.module')
        .then(m => m.UsuarioCodigoValidarPageModule),
  },

  {
    path: 'usuario-crear-password',
    loadChildren: () =>
      import('./pages/usuario-crear-password/usuario-crear-password.module')
        .then(m => m.UsuarioCrearPasswordPageModule),
  },

  {
    path: 'vende',
    loadChildren: () =>
      import('./pages/vende-network/vende-network.module')
        .then(m => m.VendeNetworkPageModule),
    canActivate: [AuthGuard],
  },

  // Fallback
  { path: '**', redirectTo: 'dashboard/network' },
];



@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }