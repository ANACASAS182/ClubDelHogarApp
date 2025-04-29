import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioPasswordRecoveryPageRoutingModule } from './usuario.password.recovery-routing.module';

import { UsuarioPasswordRecoveryPage } from './usuario.password.recovery.page';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuarioPasswordRecoveryPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [UsuarioPasswordRecoveryPage]
})
export class UsuarioPasswordRecoveryPageModule {}
