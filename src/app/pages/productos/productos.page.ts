import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/api.back.services/usuario.service';
import { PromocionesService } from '../../services/api.back.services/promociones.service';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Usuario } from 'src/app/models/Usuario';
import { Promocion } from 'src/app/models/Promocion';
import { ModalController } from '@ionic/angular';
import { AgregarPromocionComponent } from 'src/app/modals/agregar-promocion/agregar-promocion.component';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: false
})
export class ProductosPage implements OnInit {
  UsuarioID = 0;
  promociones: Promocion[] = [];
  cargandoPromociones = true;

  constructor(
    private usuarioService: UsuarioService,
    private promocionesService: PromocionesService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        this.UsuarioID = response.data.id;

        this.promocionesService.GetPromocionesSocio(this.UsuarioID).subscribe({
          next: (data) => {
            this.promociones = data || [];
            this.cargandoPromociones = false;
          },
          error: _ => this.cargandoPromociones = false
        });
      }
    });
  }

  // ------------------- PRESENTACIÓN DE COMISIÓN -------------------
  /** Detecta si la comisión es porcentaje (1) o dinero (0).
   *  Soporta distintas formas que pueda venir del back. */
  private esPorcentaje(p: any): boolean {
    const t =
      p?.tipoComision ??
      p?.tipoComisionEnum ??
      p?.producto?.tipoComision ??
      p?.producto?.tipoComisionEnum ??
      null;

    // Puede venir como número (0/1) o como string descriptivo
    if (t === 1 || t === '1') return true;
    if (typeof t === 'string') {
      const s = t.toLowerCase();
      if (s.includes('porcentaje') || s.includes('%')) return true;
    }
    return false; // default: MXN
  }

  /** Regresa 'MXN' o '%' */
  getComisionUnidad(p: any): string {
    return this.esPorcentaje(p) ? '%' : 'MXN';
  }

  /** Toma el número de comisión desde varias posibles props y lo formatea.
   *  Si es porcentaje y viene en 0–100, se muestra tal cual.
   *  Si alguna vez viniera 0–1, multiplica por 100 aquí. */
  getComisionValor(p: any): string {
    // dónde puede venir el valor: comision, nivel1, nivel_base, nivelBase...
    const raw =
      p?.comision ??
      p?.nivel1 ??
      p?.nivel_1 ??
      p?.nivelBase ??
      p?.nivel_base ??
      0;

    let v = Number(raw);
    if (!isFinite(v)) v = 0;

    // Si tu back algún día enviara 0.04 para 4%, descomenta:
    // if (this.esPorcentaje(p) && v > 0 && v < 1) v = v * 100;

    // sin decimales (ajusta a '1.0-2' en template si quieres decimales)
    return Math.round(v).toString();
  }
  // ----------------------------------------------------------------

  abrirModalPromocion(promocion: Promocion) {
    // tu lógica si hay detalle
  }

  async abrirModalAgregarPromocion() {
    let formDirty = false;
    const modal = await this.modalCtrl.create({
      component: AgregarPromocionComponent,
      cssClass: 'modal-redondeado',
      componentProps: {
        EmbajadorReferenteID: this.UsuarioID,
        setFormDirtyStatus: (dirty: boolean) => (formDirty = dirty)
      },
      canDismiss: async () => {
        if (!formDirty) return true;
        const shouldClose = true;
        return shouldClose;
      }
    });
    await modal.present();
  }
}
