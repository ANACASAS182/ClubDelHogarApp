import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { ReferidoDTO } from 'src/app/models/DTOs/ReferidoDTO';
import { SeguimientoReferido } from 'src/app/models/SeguimientoReferido';
import { SeguimientoReferidoService } from 'src/app/services/api.back.services/seguimiento.referido.service';

@Component({
  selector: 'app-referido.seguimiento.modal',
  templateUrl: './referido.seguimiento.modal.component.html',
  styleUrls: ['./referido.seguimiento.modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ReferidoSeguimientoModalComponent  implements OnInit {

  @Input() referido?: ReferidoDTO = undefined;
  seguimientos : SeguimientoReferido[] = [];

  constructor(private seguimientoReferidoService: SeguimientoReferidoService,
    private modalCtrl: ModalController,
    private toastController: ToastController
  ) { }

  ngOnInit() {

    if(this.referido == undefined){
      this.toastController.create({
        message: "No se envio referido",
        duration: 3000,
        color: "danger",
        position: 'top'
      }).then(toast => toast.present());
      this.modalCtrl.dismiss();
    }

    this.seguimientoReferidoService.getSeguimientosReferido(this.referido!.id!).subscribe({
      next: (response: GenericResponseDTO<SeguimientoReferido[]>) =>{
        this.seguimientos = response.data;
      }
    });

  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  formatFecha(fecha: Date): string {
    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    let mes = f.toLocaleString('es-MX', { month: 'long' });
    mes = mes.charAt(0).toUpperCase() + mes.slice(1); 
    const anio = f.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }

  
}
