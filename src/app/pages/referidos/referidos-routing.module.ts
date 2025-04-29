import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReferidosPage } from './referidos.page';

const routes: Routes = [
  {
    path: '',
    component: ReferidosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReferidosPageRoutingModule {}
