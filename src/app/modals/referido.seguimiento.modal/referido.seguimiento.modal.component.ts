import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { ReferidoDTO } from 'src/app/models/DTOs/ReferidoDTO';
import { SeguimientoReferido } from 'src/app/models/SeguimientoReferido';
import { SeguimientoReferidoService } from 'src/app/services/api.back.services/seguimiento.referido.service';

// ==== Utils de teléfono (normaliza MX y valida) ====
type PhoneInfo = {
  view: string;         // (+52) 55 1234 5678 | "No proporcionado" | "Número inválido"
  e164: string | null;  // +52XXXXXXXXXX si válido
  invalid: boolean;     // patrones sospechosos (1111111111, 1234567890, etc.)
};

function parseMxPhone(raw?: string | null): PhoneInfo {
  const clean = (raw ?? '').replace(/[^\d]/g, '');
  if (!clean) return { view: 'No proporcionado', e164: null, invalid: false };

  let d = clean;

  // 521 + 10 dígitos (algunos WA viejos) → quita el "1"
  if (d.startsWith('521') && d.length === 13) d = '52' + d.slice(3);

  // Si viene como 52 + 10 dígitos, recorta a 10 para formatear
  if (d.startsWith('52') && d.length === 12) d = d.slice(2);

  // Deben ser 10 dígitos nacionales
  if (d.length !== 10) return { view: 'Número inválido', e164: null, invalid: true };

  // Patrones dudosos
  const allSame = /^(\d)\1{9}$/.test(d);
  const sequential = d === '1234567890' || d === '0987654321';
  const black = d === '0000000000' || d === '1111111111';
  const invalid = allSame || sequential || black;

  const e164 = `+52${d}`;
  const view = `(+52) ${d.slice(0,2)} ${d.slice(2,6)} ${d.slice(6)}`;
  return { view, e164, invalid };
}

@Component({
  selector: 'app-referido.seguimiento.modal',
  templateUrl: './referido.seguimiento.modal.component.html',
  styleUrls: ['./referido.seguimiento.modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ReferidoSeguimientoModalComponent implements OnInit {

  @Input() referido?: ReferidoDTO = undefined;

  seguimientos: SeguimientoReferido[] = [];

  // Estado de teléfono para la vista/acciones
  phoneView: string = 'No proporcionado';
  phoneE164: string | null = null;
  phoneInvalid: boolean = false;

  constructor(
    private seguimientoReferidoService: SeguimientoReferidoService,
    private modalCtrl: ModalController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    if (!this.referido) {
      const t = await this.toastController.create({
        message: 'No se envió el referido',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      t.present();
      this.modalCtrl.dismiss();
      return;
    }

    // Normaliza/valida teléfono del referido
    const info = parseMxPhone(this.referido.celular);
    this.phoneView = info.view;
    this.phoneE164 = info.e164;
    this.phoneInvalid = info.invalid;

    // Cargar seguimientos
    this.seguimientoReferidoService.getSeguimientosReferido(this.referido.id!).subscribe({
      next: (response: GenericResponseDTO<SeguimientoReferido[]>) => {
        this.seguimientos = response.data;
      }
    });
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  // Acciones: deshabilitadas si no hay phoneE164
  llamar() {
    if (!this.phoneE164) return;
    window.open(`tel:${this.phoneE164}`, '_system');
  }

  whatsapp() {
    if (!this.phoneE164) return;
    const digits = this.phoneE164.replace(/[^\d]/g, ''); // 52 + 10
    window.open(`https://wa.me/${digits}`, '_blank');
  }

  formatFecha(fecha: Date): string {
    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    let mes = f.toLocaleString('es-MX', { month: 'long' });
    mes = mes.charAt(0).toUpperCase() + mes.slice(1);
    const anio = f.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }

  mostrarTodos = false;

  trackBySeg(index: number, _item: SeguimientoReferido) {
    return index; // si tienes id, usa item.id
  }

}
