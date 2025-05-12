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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReferidosPageRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    LoaderComponent
],
  declarations: [ReferidosPage]
})
export class ReferidosPageModule {}
