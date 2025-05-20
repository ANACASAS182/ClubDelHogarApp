import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ActivacionesPageRoutingModule } from './activaciones-routing.module';


import { ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from "../../loader/loader.component"; 
import { ActivacionesPage } from './activaciones.page';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ActivacionesPageRoutingModule,
    ReactiveFormsModule,
    LoaderComponent
],
  declarations: [ActivacionesPage]
})
export class ActivacionesPageModule {


}
