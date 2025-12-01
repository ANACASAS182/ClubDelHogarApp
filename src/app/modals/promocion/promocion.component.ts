import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

import { Promocion } from 'src/app/models/Promocion';
import {
  PromocionesService,
  SolicitudCodigoQrRequest
} from 'src/app/services/api.back.services/promociones.service';

@Component({
  selector: 'app-promocion.modal',
  templateUrl: './promocion.component.html',
  styleUrls: ['./promocion.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class PromocionComponent implements OnInit {

  @Input() promoSeleccionada?: Promocion;
  @Input() UsuarioID: number = 0;
  @Input() setFormDirtyStatus?: (dirty: boolean) => void; // si el caller aún lo manda

  promocion?: Promocion;

  codigoQrBase64 = '';
  cargandoQr = false;

  yaCanjeado = false;
  mensajeEstado = '';

  constructor(
    private modalCtrl: ModalController,
    private promocionesService: PromocionesService
  ) {}

  ngOnInit(): void {
    this.promocion = this.promoSeleccionada;
    this.generarQrUnicoUso();
  }

  // ================== QR UN SOLO USO ==================

  private generarQrUnicoUso(): void {
    if (!this.promoSeleccionada?.iD) {
      console.warn('[PromocionModal] Promo sin ID, no se puede generar QR');
      return;
    }

    this.cargandoQr = true;
    this.yaCanjeado = false;
    this.mensajeEstado = '';
    this.codigoQrBase64 = '';

    const solicitud: SolicitudCodigoQrRequest = {
      ProductoID: this.promoSeleccionada.iD,
      embajadorID: this.UsuarioID,
      InformacionContacto: '',
      nombres: ''
    };

    this.promocionesService.GenerarCodigoPromocion(solicitud).subscribe({
      next: (data: any) => {
        this.cargandoQr = false;

        if (data?.yaCanjeado) {
          this.yaCanjeado = true;
          this.mensajeEstado =
            data.mensaje ||
            'Esta promoción ya fue validada. Te recomendamos explorar más promociones. ¡Gracias por tu interés!';

          this.codigoQrBase64 = '';
          return;
        }

        this.codigoQrBase64 = data?.qr64 || '';
      },
      error: (err) => {
        console.error('[PromocionModal] Error generando QR', err);
        this.cargandoQr = false;
        this.codigoQrBase64 = '';
        this.mensajeEstado =
          'No pudimos generar tu código en este momento. Inténtalo de nuevo más tarde.';
      }
    });
  }

  // ================== HELPERS DE IMÁGENES ==================

  get promoImg(): string | null {
    const p: any = this.promocion || {};

    const rawB64 =
      p.productoImgBase64 ||       // 👈 de GetPromosNetwork
      p.ProductoImagenBase64 ||    // por si viene con mayúsculas
      p.productoImagenBase64 ||    // otra variante
      p.imagenBase64 ||            // modelo viejo de Producto
      null;

    const path =
      p.productoImgPath ||
      p.productoImagenPath ||
      p.imagenPath ||
      null;

    if (rawB64) {
      const clean = String(rawB64).trim().replace(/\s+/g, '');
      return clean.startsWith('data:')
        ? clean
        : `data:image/png;base64,${clean}`;
    }

    return path;
  }

  get empresaLogo(): string | null {
    const p: any = this.promocion || {};

    const rawB64 =
      p.empresaLogotipoBase64 ||   // 👈 de GetPromosNetwork
      p.empresaLogoBase64 ||
      p.logotipoBase64 ||
      null;

    const path =
      p.empresaLogotipoPath ||
      p.empresaLogoPath ||
      p.logotipoPath ||
      null;

    if (rawB64) {
      const clean = String(rawB64).trim().replace(/\s+/g, '');
      return clean.startsWith('data:')
        ? clean
        : `data:image/png;base64,${clean}`;
    }

    return path;
  }


  // ================== UTILIDADES ==================

  close(): void {
    this.modalCtrl.dismiss();
  }

  getTituloCorto(max: number = 32): string {
    const nombre = this.promocion?.nombre || '';
    return nombre.length > max ? nombre.slice(0, max) + '…' : nombre;
  }

  get empresaUbicacion(): string {
    const p: any = this.promocion || {};

    const raw =
      p.empresaUbicacion ||   // desde GetPromosNetwork
      p.ubicacion ||          // por si en otro lado viene así
      p.empresa?.ubicacion || // por si viene anidada
      '';

    const clean = String(raw || '').trim();
    return clean || 'N/A';
  }

}