import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonicModule, LoadingController, ModalController, NavParams, ToastController } from '@ionic/angular';
import { IonInput, IonButton, IonHeader, IonItem, IonToolbar } from "@ionic/angular/standalone";
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Empresa } from 'src/app/models/Empresa';
import { Producto } from 'src/app/models/Producto';
import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { ProductoService } from 'src/app/services/api.back.services/producto.service';
import { ReferidoService } from 'src/app/services/api.back.services/referido.service';
import { ReferidoDTO } from 'src/app/models/DTOs/ReferidoDTO';
import { finalize, firstValueFrom } from 'rxjs';
import { EmbajadorInvitadoDTO } from 'src/app/models/DTOs/EmbajadorInvitadoDTO';
import { EmbajadoresService } from 'src/app/services/api.back.services/embajadores.service';
import { Promocion } from 'src/app/models/Promocion';
import { PromocionesService, SolicitudCodigoQrRequest } from 'src/app/services/api.back.services/promociones.service';

import html2canvas from 'html2canvas';

@Component({
  selector: 'app-promocion.modal',
  templateUrl: './promocion.component.html',
  styleUrls: ['./promocion.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class PromocionComponent implements OnInit {

  formulario: FormGroup;
  empresas: Empresa[] = [];
  productos: Producto[] = [];

  formEnviado: boolean = false;
  hideProducto: boolean = true;


  @Input() promoSeleccionada?: Promocion;
  @Input() setFormDirtyStatus: ((dirty: boolean) => void) | undefined;

  @ViewChild('captureDiv') captureDiv!: ElementRef;

  promocion?: Promocion;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private embajadoresService: EmbajadoresService,
    private promocionesService: PromocionesService
  ) {

    this.formulario = this.fb.group({
      email: ['', Validators.required]
    });
  }

  capturarReferido:boolean = false;
  habilitarCapturaReferido(){
    this.capturarReferido = true;
  }

  async ngOnInit() {


    this.formulario.valueChanges.subscribe(() => {
      const isDirty = this.formulario.dirty;
      if (this.setFormDirtyStatus) {
        this.setFormDirtyStatus(isDirty);
      }
    });


    this.promocion = this.promoSeleccionada;

  }

  qrGenerado: boolean = false;
  codigoQrBase64:string = "";
  generarQR() {
    let solicitud: SolicitudCodigoQrRequest = {
      ProductoID: 1,
      embajadorID: 1,
      celular: "6565303760",
      nombres: "PRUEBA PRUEBA"
    };


    this.promocionesService.GenerarCodigoPromocion(solicitud!).subscribe({
      next: (data) => {
        this.qrGenerado = true;
        this.codigoQrBase64 = data.qr64;
      }
    });

  }

  descargarImagen() {
    // const link = document.createElement('a');
    // link.href = 'assets/ejemplo_qr.png';
    // link.download = 'mi_qr.png';
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);

    html2canvas(this.captureDiv.nativeElement).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'captura.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });

  }


  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  invitacionEnviada: boolean = false;
  invitacionEnviadaCorrectamente: boolean = true;
  mensaje_invitacion: string = "";

  enviarFormulario() {
    if (this.formulario.valid) {

      let invitado: EmbajadorInvitadoDTO = {
        referente_id: 1,
        email: this.formulario.controls["email"].value
      }

      this.embajadoresService.postInvitarNuevoEmbajador(invitado).subscribe({
        next: (data) => {
          this.invitacionEnviada = true;
          this.invitacionEnviadaCorrectamente = data.estatus > 0;
          this.mensaje_invitacion = data.mensaje;
        },
        error: (err) => { },
        complete: () => { },
      });



    } else {
      this.formulario.markAllAsTouched();
      this.formEnviado = false;
    }

  }

  getControl(name: string) {
    return this.formulario.get(name);
  }

  close() {
    this.modalCtrl.dismiss();
  }
  isDirty(): boolean {
    return this.formulario.dirty;
  }
}
