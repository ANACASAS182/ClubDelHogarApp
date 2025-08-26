import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmpresaDetailsPage } from './empresa.details.page';

const routes: Routes = [
  {
    path: '',
    component: EmpresaDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmpresaDetailsPageRoutingModule {}