import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuarioPasswordRecoveryPage } from './usuario.password.recovery.page';

const routes: Routes = [
  {
    path: '',
    component: UsuarioPasswordRecoveryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuarioPasswordRecoveryPageRoutingModule {}
