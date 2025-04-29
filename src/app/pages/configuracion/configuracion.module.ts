import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfiguracionPageRoutingModule } from './configuracion-routing.module';

import { ConfiguracionPage } from './configuracion.page';
import { ReactiveFormsModule } from '@angular/forms'; 

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfiguracionPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ConfiguracionPage]
})
export class ConfiguracionPageModule {}
