import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioCrearPasswordPageRoutingModule } from './usuario-crear-password-routing.module';

import { UsuarioCrearPasswordPage } from './usuario-crear-password.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuarioCrearPasswordPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [UsuarioCrearPasswordPage]
})
export class UsuarioCrearPasswordPageModule {}
