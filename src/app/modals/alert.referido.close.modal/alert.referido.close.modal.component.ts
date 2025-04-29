import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-alert.referido.close.modal',
  templateUrl: './alert.referido.close.modal.component.html',
  styleUrls: ['./alert.referido.close.modal.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class AlertReferidoCloseModalComponent  implements OnInit {

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  dismiss(cerrar: boolean) {
    this.modalCtrl.dismiss({ cerrar });
  }
}
