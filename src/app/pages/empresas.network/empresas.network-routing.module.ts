import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmpresasNetworkPage } from './empresas.network.page';

const routes: Routes = [
  {
    path: '',
    component: EmpresasNetworkPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmpresasNetworkPageRoutingModule {}
