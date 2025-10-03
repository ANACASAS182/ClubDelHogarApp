import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonGrid, IonRow, IonCol, IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
  imports:[IonGrid, IonRow, IonCol, IonIcon, CommonModule],
})
export class ProductoComponent implements OnInit, OnChanges {
  @Input() promocion: any;
  @Input() debug = false;
   @Input() mostrarAcciones: boolean = true;
  @Output() addClicked = new EventEmitter<void>();
  @Output() qrClicked  = new EventEmitter<void>();
  

  ngOnInit()  { if (this.debug) this.logPromo('OnInit'); }
  ngOnChanges(ch: SimpleChanges) { if (this.debug && ch['promocion']) this.logPromo('OnChanges'); }

  onAdd() { this.addClicked.emit(); }
  onQr()  { this.qrClicked.emit(); }      // <- NUEVO

  private tipoComisionDe(p: any): 0 | 1 {
    const t = p?.tipoComision ?? p?.TipoComision ?? p?.producto?.tipoComision ?? p?.producto?.TipoComision ?? 0;
    const n = Number(t);
    return (n === 1 || t === '1') ? 1 : 0;
  }

  get moneda(): string {
    const p = this.promocion || {};
    return p?.moneda ?? p?.Moneda ?? p?.producto?.moneda ?? p?.producto?.Moneda ?? 'MXN';
  }

  /** 0 = MXN, 1 = % */
  get tipo(): 0 | 1 { return this.tipoComisionDe(this.promocion || {}); }

  get monto(): number {
    const p = this.promocion || {};
    const raw = p?.comisionCantidad ?? p?.ComisionCantidad ?? p?.producto?.comisionCantidad ?? p?.producto?.ComisionCantidad;
    const cant = (typeof raw === 'string' && raw.includes('%')) ? 0 : Number(raw) || 0;
    const precio = Number(p?.precio ?? p?.Precio ?? p?.producto?.precio ?? p?.producto?.Precio) || 0;
    const v = cant || precio || 0;
    return Number.isFinite(v) ? v : 0;
  }

  get pct(): number {
    const p = this.promocion || {};
    let v = Number(p?.comisionPorcentaje ?? p?.ComisionPorcentaje ?? p?.producto?.comisionPorcentaje ?? p?.producto?.ComisionPorcentaje) || 0;
    if (v > 0 && v < 1) v *= 100;
    return Number.isFinite(v) ? v : 0;
  }

  private logPromo(tag: string) {
    const p = this.promocion || {};
    console.groupCollapsed(`🧪 CardDebug [${tag}] id=${p.id ?? p.ID} nombre=${p.nombre ?? p.Nombre}`);
    console.table([{
      tipoComision: p.tipoComision ?? p.TipoComision ?? p?.producto?.tipoComision ?? p?.producto?.TipoComision,
      comisionCantidad: p.comisionCantidad ?? p.ComisionCantidad ?? p?.producto?.comisionCantidad ?? p?.producto?.ComisionCantidad,
      comisionPorcentaje: p.comisionPorcentaje ?? p.ComisionPorcentaje ?? p?.producto?.comisionPorcentaje ?? p?.producto?.ComisionPorcentaje,
      precio: p.precio ?? p.Precio ?? p?.producto?.precio ?? p?.producto?.Precio,
      tipoCalculado: this.tipo,
      montoCalc: this.monto,
      pctCalc: this.pct
    }]);
    console.groupEnd();
  }

  formatPlano(valor: any, moneda: string): string {
    const n = Number(valor || 0);
    const s = n.toFixed(2).replace(/\.00$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
    return `${s} ${moneda}`;
  }

  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).src = 'assets/imgs/logo-placeholder.png';
  }

  qrPlaceholder = 'assets/icons/codigo-qr.png';
}
