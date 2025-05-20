import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductosPageRoutingModule } from './productos-routing.module';

import { ProductosPage } from './productos.page';
import { LoaderComponent } from "../../loader/loader.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductosPageRoutingModule,
    LoaderComponent
],
  declarations: [ProductosPage]
})
export class ProductosPageModule {}
