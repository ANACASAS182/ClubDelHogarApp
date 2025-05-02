import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CelulaPageRoutingModule } from './celula-routing.module';

import { CelulaPage } from './celula.page';
import { ReactiveFormsModule } from '@angular/forms'; 


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CelulaPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [CelulaPage]
})
export class CelulaPageModule {

  

}
