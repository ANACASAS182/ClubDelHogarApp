import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { UsuarioRegistroResolver } from './resolvers/usuario.registro.resolver';
import { NoAuthGuard } from './guards/no-auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    canActivate: [NoAuthGuard],
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/usuario.registro/usuario.registro.module').then( m => m.UsuarioRegistroPageModule),
    canActivate: [NoAuthGuard],
    resolve: {
      resolverData: UsuarioRegistroResolver
    }
  },
  {
    path: 'password/recovery',
    loadChildren: () => import('./pages/usuario.password.recovery/usuario.password.recovery.module').then( m => m.UsuarioPasswordRecoveryPageModule),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'password/reset',
    loadChildren: () => import('./pages/usuario.password.reset/usuario.password.reset.module').then( m => m.UsuarioPasswordResetPageModule),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
