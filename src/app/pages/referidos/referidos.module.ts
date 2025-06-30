import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReferidosPageRoutingModule } from './referidos-routing.module';

import { ReferidosPage } from './referidos.page';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { LoaderComponent } from "../../loader/loader.component";
import { MensajeTemporalComponent } from 'src/app/mensaje-temporal/mensaje-temporal.component';
import { ResumenComponent } from 'src/app/utils/resumen/resumen.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReferidosPageRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    LoaderComponent,
    MensajeTemporalComponent,
    ResumenComponent
],
  declarations: [ReferidosPage]
})
export class ReferidosPageModule {}
