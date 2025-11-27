import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { VendeNetworkPage } from './vende-network.page';

const routes: Routes = [
  {
    path: '',
    component: VendeNetworkPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendeNetworkPageRoutingModule {}