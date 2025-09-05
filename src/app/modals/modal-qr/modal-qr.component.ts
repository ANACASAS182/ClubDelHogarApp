import { Component, Input, OnInit } from '@angular/core';

import { Html5Qrcode } from 'html5-qrcode';
import { IonicModule, ModalController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/api.back.services/usuario.service';
import { PromocionesService, ValidarPromocionQrRequest } from '../../services/api.back.services/promociones.service';
import { LoaderComponent } from "../../loader/loader.component";
import { Promocion } from 'src/app/models/Promocion';

@Component({
  selector: 'app-modal-qr',
  templateUrl: './modal-qr.component.html',
  styleUrls: ['./modal-qr.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, LoaderComponent],
})
export class ModalQRComponent implements OnInit {

  EstatusObtenerInformacionDelCodigo: number = 0;
  EstatusDelCodigo: number = 0;
  MotivoInactividad: string = "";
  EstatusActivacionDelCodigo: number = 0;


  promocionRelacionada?:Promocion;

  constructor(
    private usuarioService: UsuarioService,
    private promocionesService: PromocionesService,
    private modalCtrl: ModalController,
  ) {


  }

  @Input() codigoParametro: string = "";

  codigoPromocion: string = "";
  html5QrCode: Html5Qrcode | undefined; //new Html5Qrcode("reader");
  copiarCodigo(code: string) {
  navigator.clipboard?.writeText(code || '').catch(() => {});
}
  ngOnInit() {
    if(this.codigoParametro != ""){
      this.iniciarCaptura(this.codigoParametro);
    }

  }


  close() {
    this.modalCtrl.dismiss();
  }

  timeoutId: any; // declara esto en tu componente/clase

  ActivarPromocion() {

    console.log("activando promocion");

    let request: ValidarPromocionQrRequest = {
      UsuarioID: 1,
      codigoPromocion: this.codigoPromocion
    };

    this.promocionesService.PostHacerPromocionValida(request).subscribe({
      next: (data) => {
        if (data.estatus == 1) {
          this.EstatusActivacionDelCodigo = 1; // muestra el bloque de éxito
          // this.EstatusDelCodigo = -1;  
          this.MotivoInactividad = '';  // opcional
            } else {
          this.EstatusActivacionDelCodigo = -1;
          this.MotivoInactividad = data.mensaje;
        }
      },
      error: (err) => {
        this.EstatusActivacionDelCodigo = -1;
        this.MotivoInactividad = "Ocurrió un error, por favor intente nuevamente";
      },
      complete: () => {
        this.EstatusObtenerInformacionDelCodigo = 0;
      }
    });

  }


  iniciarCaptura(decodedText:string) {
    if (decodedText.includes('https://ebg.bithub.com.mx/val/')) {
      this.codigoPromocion = decodedText.replace('https://ebg.bithub.com.mx/val/', '');
      this.EstatusObtenerInformacionDelCodigo = 1;

      let request: ValidarPromocionQrRequest = {
        UsuarioID: 1,
        codigoPromocion: this.codigoPromocion
      };

      this.promocionesService.ConsultarEstatusDelCodigoQr(request).subscribe({
        next: (data) => {
          if (data.estatus == 1) {
            this.EstatusDelCodigo = 1;
            this.promocionRelacionada = data.promocion;
          }
          if (data.estatus == -1) {
            this.EstatusDelCodigo = -1;
            this.MotivoInactividad = data.mensaje;
          }
        },
        error: (err) => {
          this.EstatusDelCodigo = -1;
          this.MotivoInactividad = "Ocurrió un error, por favor intente nuevamente";
        },
        complete: () => {
          this.EstatusObtenerInformacionDelCodigo = 0;
        }
      });

    } else {
      this.codigoPromocion = "NO VALIDO";
      this.EstatusDelCodigo = -1;
      this.MotivoInactividad = "El Código QR proporcionado no pertenece a Embassy";
    }
  }

  


}
