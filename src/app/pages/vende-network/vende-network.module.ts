import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { VendeNetworkPageRoutingModule } from './vende-network-routing.module';
import { VendeNetworkPage } from './vende-network.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VendeNetworkPageRoutingModule,
  ],
  declarations: [VendeNetworkPage],
})
export class VendeNetworkPageModule {}