import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuarioCodigoValidarPage } from './usuario.codigo.validar.page';

const routes: Routes = [
  {
    path: '',
    component: UsuarioCodigoValidarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuarioCodigoValidarPageRoutingModule {}
