import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmpresaDetailsPageRoutingModule } from './empresa.details-routing.module';

import { EmpresaDetailsPage } from './empresa.details.page';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ModalAlerReferidoService } from 'src/app/services/modal.alert.referido.service';
import { LoaderComponent } from "../../loader/loader.component";
import { ProductoComponent } from "../../utils/producto/producto.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmpresaDetailsPageRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    LoaderComponent,
    ProductoComponent
],
  declarations: [EmpresaDetailsPage],
})
export class EmpresaDetailsPageModule {}
