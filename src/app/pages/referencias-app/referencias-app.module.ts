import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ReferenciasAppRouting } from './referencias-app.routing';
import { ReferenciasAppPage } from './referencias-app.page';

// opcionales pero útiles
//import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  declarations: [ReferenciasAppPage],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, IonicModule,
    //IonicSelectableModule,
    ReferenciasAppRouting
  ]
})
export class ReferenciasAppModule {}
