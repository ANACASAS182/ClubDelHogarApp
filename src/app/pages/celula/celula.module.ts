import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CelulaPageRoutingModule } from './celula-routing.module';

import { CelulaPage } from './celula.page';
import { ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from "../../loader/loader.component";
import { ResumenComponent } from "../../utils/resumen/resumen.component"; 


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CelulaPageRoutingModule,
    ReactiveFormsModule,
    LoaderComponent,
    ResumenComponent
],
  declarations: [CelulaPage]
})
export class CelulaPageModule {


}
