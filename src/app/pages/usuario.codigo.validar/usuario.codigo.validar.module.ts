import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioCodigoValidarPageRoutingModule } from './usuario.codigo.validar-routing.module';

import { UsuarioCodigoValidarPage } from './usuario.codigo.validar.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    UsuarioCodigoValidarPageRoutingModule
  ],
  declarations: [UsuarioCodigoValidarPage]
})
export class UsuarioCodigoValidarPageModule {}
