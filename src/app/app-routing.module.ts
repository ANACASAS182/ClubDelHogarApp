// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { UsuarioRegistroResolver } from './resolvers/usuario.registro.resolver';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AuthGuard } from './guards/auth.guard';
import { OnboardingGuard } from './guards/onboarding.guard';
import { OnboardingComponent } from './modals/onboarding/onboarding.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // App arranca en network
  { path: '', redirectTo: 'dashboard/network', pathMatch: 'full' },

  // LOGIN (por si luego lo quieres usar manualmente)
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule),
  },

  // REGISTRO (flujo de referencias)
  {
    path: 'registro',
    loadChildren: () => import('./pages/usuario.registro/usuario.registro.module')
      .then(m => m.UsuarioRegistroPageModule),
    resolve: { resolverData: UsuarioRegistroResolver }
  },
  {
    path: 'registro/:codigo',
    loadChildren: () => import('./pages/usuario.registro/usuario.registro.module')
      .then(m => m.UsuarioRegistroPageModule),
    resolve: { resolverData: UsuarioRegistroResolver }
  },

  // PASSWORD
  {
    path: 'password/recovery',
    loadChildren: () => import('./pages/usuario.password.recovery/usuario.password.recovery.module')
      .then(m => m.UsuarioPasswordRecoveryPageModule)
  },
  {
    path: 'password/reset',
    loadChildren: () => import('./pages/usuario.password.reset/usuario.password.reset.module')
      .then(m => m.UsuarioPasswordResetPageModule)
  },

  // ONBOARDING
  {
    path: 'onboarding',
    component: OnboardingComponent,
    canActivate: [NoAuthGuard],
    // si tienes pasos, puedes anidar children (ej. bienvenida, datos, ubicación)
  },

  // DASHBOARD
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule),
    canActivate: [NoAuthGuard],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'activaciones',
    loadChildren: () => import('./pages/activaciones/activaciones.module').then(m => m.ActivacionesPageModule),
    canActivate: [NoAuthGuard],
    runGuardsAndResolvers: 'always'
  },
  { path: 'dashboard/referencias-app', 
    loadChildren: () => import('./pages/referencias-app/referencias-app.module').then(m => m.ReferenciasAppModule) 
  },

  // VALIDAR CÓDIGO
  {
    path: 'validar-codigo',
    loadChildren: () =>
      import('./pages/usuario.codigo.validar/usuario.codigo.validar.module')
        .then(m => m.UsuarioCodigoValidarPageModule)
  },

  // CREAR PASSWORD
  {
    path: 'usuario-crear-password',
    loadChildren: () =>
      import('./pages/usuario-crear-password/usuario-crear-password.module')
        .then(m => m.UsuarioCrearPasswordPageModule)
  },

  {
    path: 'vende',
    loadChildren: () =>
      import('./pages/vende-network/vende-network.module')
        .then(m => m.VendeNetworkPageModule)
  },


  // Fallback
  { path: '**', redirectTo: 'dashboard/network' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }