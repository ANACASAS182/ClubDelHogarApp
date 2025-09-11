import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ReferidoService } from 'src/app/services/api.back.services/referido.service';

@Component({
  selector: 'app-qr-referido-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './qr-referido.modal.component.html',
  styleUrls: ['./qr-referido.modal.component.scss'],
})
export class QrReferidoModalComponent implements OnInit {
  @Input() referidoId!: number;
  @Input() referidoNombre?: string;

  private referidoService = inject(ReferidoService);
  private modalCtrl = inject(ModalController);
  private toast = inject(ToastController);

  loading = true;
  error?: string;
  codigo?: string;
  imgUrl?: string;

  async ngOnInit() {
    try {
      // Trae datos (código); si el back devuelve 404, cae al catch
      const resp = await firstValueFrom(
        this.referidoService.getQrUrlByReferido(this.referidoId)
      );
      this.codigo = resp.codigo;
    } catch (e: any) {
      this.error = e?.error?.mensaje ?? 'No se encontró QR para este referido';
    } finally {
      // SIEMPRE usa el endpoint del API para mostrar/abrir la imagen
      this.imgUrl = this.referidoService.getQrPngByReferidoUrl(this.referidoId);
      this.loading = false;
    }
  }

  close() { this.modalCtrl.dismiss(); }

  async copyCodigo() {
    if (!this.codigo) return;
    await navigator.clipboard.writeText(this.codigo);
    const t = await this.toast.create({
      message: 'Código copiado',
      duration: 1200,
      position: 'bottom'
    });
    t.present();
  }

  openInNewTab() {
    if (this.imgUrl) window.open(this.imgUrl, '_blank');
  }
}