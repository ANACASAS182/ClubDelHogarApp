// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { UsuarioRegistroResolver } from './resolvers/usuario.registro.resolver';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AuthGuard } from './guards/auth.guard';
import { OnboardingGuard } from './guards/onboarding.guard';

// Si tu onboarding es componente standalone:
import { OnboardingComponent } from './modals/onboarding/onboarding.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule),
    canActivate: [NoAuthGuard],
  },

  {
    path: 'registro',
    loadChildren: () => import('./pages/usuario.registro/usuario.registro.module').then(m => m.UsuarioRegistroPageModule),
    canActivate: [NoAuthGuard],
    resolve: { resolverData: UsuarioRegistroResolver }
  },
  {
    path: 'registro/:codigo',
    loadChildren: () => import('./pages/usuario.registro/usuario.registro.module').then(m => m.UsuarioRegistroPageModule),
    canActivate: [NoAuthGuard],
    resolve: { resolverData: UsuarioRegistroResolver }
  },

  {
    path: 'password/recovery',
    loadChildren: () => import('./pages/usuario.password.recovery/usuario.password.recovery.module').then(m => m.UsuarioPasswordRecoveryPageModule),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'password/reset',
    loadChildren: () => import('./pages/usuario.password.reset/usuario.password.reset.module').then(m => m.UsuarioPasswordResetPageModule),
    canActivate: [NoAuthGuard]
  },

  // 👇 Ruta al Onboarding (protegida solo por AuthGuard)
  {
    path: 'onboarding',
    component: OnboardingComponent,
    canActivate: [AuthGuard],
    // si tienes pasos, puedes anidar children (ej. bienvenida, datos, ubicación)
  },

  // 👇 Rutas privadas: requieren sesión **y** pasar OnboardingGuard
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule),
    canActivate: [AuthGuard, OnboardingGuard],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'activaciones',
    loadChildren: () => import('./pages/activaciones/activaciones.module').then(m => m.ActivacionesPageModule),
    canActivate: [AuthGuard, OnboardingGuard],
    runGuardsAndResolvers: 'always'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }