import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuarioCrearPasswordPage } from './usuario-crear-password.page';

const routes: Routes = [
  {
    path: '',
    component: UsuarioCrearPasswordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuarioCrearPasswordPageRoutingModule {}
