import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Promocion } from 'src/app/models/Promocion';
import { IonGrid, IonRow, IonCol } from "@ionic/angular/standalone";

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  imports:[IonGrid, IonRow, IonCol, CommonModule],
  styleUrls: ['./producto.component.scss'],
})
export class ProductoComponent implements OnInit {
  @Input() promocion: any;

  ngOnInit() {}

    // 0 = Monto, 1 = Porcentaje (con inferencia si no viene)
  // producto.component.ts
  get tipo(): 0 | 1 | null {
    return this.promocion?.tipoComision ?? null;
  }

  get moneda(): string {
    return this.promocion?.moneda ?? 'MXN';
  }

  get monto(): number {
    return Number(this.promocion?.comisionCantidad ?? 0);
  }

  get pct(): number {
    return Number(this.promocion?.comisionPorcentaje ?? 0);
  }

  formatPlano(valor: any, moneda: string): string {
  const n = Number(valor || 0);
  const s = n.toFixed(2).replace(/\.00$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  return `${s} ${moneda}`;
}

  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    img.src = 'assets/imgs/logo-placeholder.png';
  }

  
}