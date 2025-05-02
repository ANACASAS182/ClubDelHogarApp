import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CelulaPage } from './celula.page';

const routes: Routes = [
  {
    path: '',
    component: CelulaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CelulaPageRoutingModule {}
