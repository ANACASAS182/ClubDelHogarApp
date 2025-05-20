import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivacionesPage } from './activaciones.page';

const routes: Routes = [
  {
    path: '',
    component: ActivacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivacionesPageRoutingModule {}
