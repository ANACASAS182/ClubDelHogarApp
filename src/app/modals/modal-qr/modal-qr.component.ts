import { Component, Input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';
import { IonicModule, ModalController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UsuarioService } from '../../services/api.back.services/usuario.service';
import {
  PromocionesService,
  ValidarPromocionQrRequest
} from '../../services/api.back.services/promociones.service';
import { LoaderComponent } from '../../loader/loader.component';
import { Promocion } from 'src/app/models/Promocion';

@Component({
  selector: 'app-modal-qr',
  templateUrl: './modal-qr.component.html',
  styleUrls: ['./modal-qr.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, LoaderComponent],
})
export class ModalQRComponent implements OnInit, AfterViewInit, OnDestroy {

  EstatusObtenerInformacionDelCodigo: number = 0;
  EstatusDelCodigo: number = 0;
  MotivoInactividad: string = '';
  EstatusActivacionDelCodigo: number = 0;

  promocionRelacionada?: Promocion;

  @Input() codigoParametro: string = '';

  codigoPromocion: string = '';

  html5QrCode?: Html5Qrcode;
  private isScanning = false;

  constructor(
    private usuarioService: UsuarioService,
    private promocionesService: PromocionesService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit(): void {
    // Si te mandan un código directo, solo procesa ese
    if (this.codigoParametro) {
      this.iniciarCaptura(this.codigoParametro);
    }
  }

  ngAfterViewInit(): void {
    // Si NO viene código por input, arrancamos la cámara
    if (!this.codigoParametro) {
      this.iniciarScanner();
    }
  }

  ngOnDestroy(): void {
    this.detenerScanner();
  }

  // =================== ESCÁNER ===================

  private iniciarScanner(): void {
    if (this.isScanning) return;

    try {
      this.html5QrCode = new Html5Qrcode('qr-reader');
    } catch (err) {
      console.error('[ModalQR] Error creando Html5Qrcode', err);
      return;
    }

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    };

    this.isScanning = true;

    this.html5QrCode
      .start(
        { facingMode: 'environment' },
        config,
        (decodedText: string) => {
          if (!decodedText) return;

          console.log('[ModalQR] QR leído:', decodedText);

          // Solo queremos un código → detenemos la cámara
          this.detenerScanner();
          this.iniciarCaptura(decodedText);
        },
        (_errorMessage: string) => {
          // errores de lectura contínuos, los ignoramos
        }
      )
      .catch(err => {
        console.error('[ModalQR] Error iniciando cámara', err);
        this.isScanning = false;
      });
  }

  private detenerScanner(): void {
    if (!this.html5QrCode || !this.isScanning) return;

    this.html5QrCode
      .stop()
      .then(() => {
        this.html5QrCode?.clear();
        this.isScanning = false;
      })
      .catch(err => {
        console.warn('[ModalQR] Error deteniendo cámara', err);
        this.isScanning = false;
      });
  }

  // =================== LÓGICA CÓDIGO ===================

  copiarCodigo(code: string) {
    navigator.clipboard?.writeText(code || '').catch(() => {});
  }

  ActivarPromocion() {
    console.log('[ModalQR] Activando promoción');

    this.EstatusActivacionDelCodigo = 2; // activando

    const request: ValidarPromocionQrRequest = {
      UsuarioID: 1, // TODO: sustituir por el usuario real
      codigoPromocion: this.codigoPromocion
    };

    this.promocionesService.PostHacerPromocionValida(request).subscribe({
      next: (data) => {
        if (data.estatus === 1) {
          this.EstatusActivacionDelCodigo = 1;
          this.MotivoInactividad = '';
        } else {
          this.EstatusActivacionDelCodigo = -1;
          this.MotivoInactividad = data.mensaje;
        }
      },
      error: () => {
        this.EstatusActivacionDelCodigo = -1;
        this.MotivoInactividad = 'Ocurrió un error, por favor intente nuevamente';
      },
      complete: () => {
        this.EstatusObtenerInformacionDelCodigo = 0;
      }
    });
  }

  private extraerCodigo(src: string): string | null {
    const s = (src || '').trim();

    // 1) URL con /val/{guid}
    const m = s.match(/\/val\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (m) return m[1];

    // 2) Solo el GUID
    const g = s.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    if (g) return s;

    return null;
  }

  iniciarCaptura(decodedText: string) {
    const codigo = this.extraerCodigo(decodedText);

    if (!codigo) {
      this.codigoPromocion = 'NO VALIDO';
      this.EstatusDelCodigo = -1;
      this.MotivoInactividad = 'El Código QR proporcionado no pertenece a Embassy';
      return;
    }

    this.codigoPromocion = codigo;
    this.EstatusObtenerInformacionDelCodigo = 1;
    this.EstatusDelCodigo = 0;
    this.EstatusActivacionDelCodigo = 0;
    this.MotivoInactividad = '';

    const request: ValidarPromocionQrRequest = {
      UsuarioID: 1, // TODO: sustituir por el usuario real
      codigoPromocion: codigo
    };

    this.promocionesService.ConsultarEstatusDelCodigoQr(request).subscribe({
      next: (data) => {
        if (data.estatus === 1) {
          this.EstatusDelCodigo = 1;
          this.promocionRelacionada = data.promocion ?? data.promocion;
        } else {
          this.EstatusDelCodigo = -1;
          this.MotivoInactividad = data.mensaje;
        }
      },
      error: () => {
        this.EstatusDelCodigo = -1;
        this.MotivoInactividad = 'Ocurrió un error, por favor intente nuevamente';
      },
      complete: () => {
        this.EstatusObtenerInformacionDelCodigo = 0;
      }
    });
  }

  // =================== CIERRE ===================

  close() {
    this.detenerScanner();
    this.modalCtrl.dismiss();
  }
}