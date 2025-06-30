import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmpresasNetworkPageRoutingModule } from './empresas.network-routing.module';

import { EmpresasNetworkPage } from './empresas.network.page';
import { LoaderComponent } from "../../loader/loader.component";
import { ResumenComponent } from "../../utils/resumen/resumen.component";
import { ProductoComponent } from "../../utils/producto/producto.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmpresasNetworkPageRoutingModule,
    LoaderComponent,
    ResumenComponent,
    ProductoComponent
],
  declarations: [EmpresasNetworkPage]
})
export class EmpresasNetworkPageModule {}
