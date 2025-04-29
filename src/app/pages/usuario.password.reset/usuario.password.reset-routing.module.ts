import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuarioPasswordResetPage } from './usuario.password.reset.page';

const routes: Routes = [
  {
    path: ':token',
    component: UsuarioPasswordResetPage
  },
  {
    path: '',
    redirectTo: '/login', 
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuarioPasswordResetPageRoutingModule {}
