import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Empresa } from 'src/app/models/Empresa';
import { Producto } from 'src/app/models/Producto';
import { EmbajadoresService } from 'src/app/services/api.back.services/embajadores.service';
import { Promocion } from 'src/app/models/Promocion';
import { PromocionesService, SolicitudCodigoQrRequest } from 'src/app/services/api.back.services/promociones.service';
import { EmbajadorInvitadoDTO } from 'src/app/models/DTOs/EmbajadorInvitadoDTO';
import { HttpClient, HttpClientModule } from '@angular/common/http';  // 👈 ADD
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-promocion.modal',
  templateUrl: './promocion.component.html',
  styleUrls: ['./promocion.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, FormsModule, HttpClientModule], // 👈 ADD
})
export class PromocionComponent implements OnInit {

  formulario: FormGroup;
  empresas: Empresa[] = [];
  productos: Producto[] = [];

  formEnviado = false;
  hideProducto = true;

  @Input() promoSeleccionada?: Promocion;
  @Input() UsuarioID: number = 0;
  @Input() setFormDirtyStatus: ((dirty: boolean) => void) | undefined;

  @ViewChild('captureDiv') captureDiv!: ElementRef;

  promocion?: Promocion;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private embajadoresService: EmbajadoresService,
    private promocionesService: PromocionesService,
    private http: HttpClient,                               // 👈 ADD
  ) {
    this.formulario = this.fb.group({
      email: ['', Validators.required]
    });
  }

  // ====== 🔌 TEST CORS-PING ======
  private testCorsPing(): void {
    this.http.get('https://ebg-api.bithub.com.mx/cors-ping', { withCredentials: false })
      .subscribe({
        next: (resp) => console.log('✅ cors-ping OK:', resp),
        error: (err) => console.error('❌ cors-ping ERROR:', err)
      });
  }
  // ===============================

  capturarReferido = false;
  habilitarCapturaReferido() { this.capturarReferido = true; }

  async ngOnInit() {
    // dispara prueba de CORS al abrir el modal
    this.testCorsPing();   // 👈 AQUÍ

    this.formulario.valueChanges.subscribe(() => {
      const isDirty = this.formulario.dirty;
      this.setFormDirtyStatus?.(isDirty);
    });

    this.promocion = this.promoSeleccionada;
  }

  NombreReferenciado = '';
  ContactoReferenciado = '';

  onTelefonoInput(ev: any) {
    const raw = (ev?.detail?.value ?? ev?.target?.value ?? '').toString();
    const soloDigitos = raw.replace(/\D+/g, '').slice(0, 10);
    this.ContactoReferenciado = soloDigitos;
  }

  get telefonoValido(): boolean { return /^\d{10}$/.test(this.ContactoReferenciado); }

  qrGenerado = false;
  codigoQrBase64 = '';
  generarQR() {
    if (!this.telefonoValido) { alert('Ingresa un teléfono válido de 10 dígitos.'); return; }
    const solicitud: SolicitudCodigoQrRequest = {
      ProductoID: this.promoSeleccionada!.iD,
      embajadorID: this.UsuarioID,
      InformacionContacto: this.ContactoReferenciado,
      nombres: this.NombreReferenciado
    };

    this.promocionesService.GenerarCodigoPromocion(solicitud).subscribe({
      next: (data) => {
        this.qrGenerado = true;
        this.codigoQrBase64 = data.qr64;
        if (data.whatsappEnviado) alert('Cupón enviado por WhatsApp ✅');
        else console.warn('No se pudo enviar por WhatsApp. Comparte el QR manualmente.');
      }
    });
  }

  descargarImagen() {
    html2canvas(this.captureDiv.nativeElement).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'captura.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  cerrarModal() { this.modalCtrl.dismiss(); }

  invitacionEnviada = false;
  invitacionEnviadaCorrectamente = true;
  mensaje_invitacion = '';

  enviarFormulario() {
    if (this.formulario.valid) {
      const invitado: EmbajadorInvitadoDTO = {
        referente_id: 1,
        email: this.formulario.controls['email'].value
      };
      this.embajadoresService.postInvitarNuevoEmbajador(invitado).subscribe({
        next: (data) => {
          this.invitacionEnviada = true;
          this.invitacionEnviadaCorrectamente = data.estatus > 0;
          this.mensaje_invitacion = data.mensaje;
        }
      });
    } else {
      this.formulario.markAllAsTouched();
      this.formEnviado = false;
    }
  }

  getControl(name: string) { return this.formulario.get(name); }
  close() { this.modalCtrl.dismiss(); }
  isDirty(): boolean { return this.formulario.dirty; }
}