import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioPasswordResetPageRoutingModule } from './usuario.password.reset-routing.module';

import { UsuarioPasswordResetPage } from './usuario.password.reset.page';

import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuarioPasswordResetPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [UsuarioPasswordResetPage]
})
export class UsuarioPasswordResetPageModule {}
