import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-invitar.modal',
  templateUrl: './invitar.component.html',
  styleUrls: ['./invitar.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class InvitarComponent implements OnInit {

  formulario: FormGroup;
  empresas: Empresa[] = [];
  productos: Producto[] = [];

  formEnviado: boolean = false;
  hideProducto: boolean = true;

  @Input() EmbajadorReferenteID: number = 0;
  @Input() setFormDirtyStatus: ((dirty: boolean) => void) | undefined;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private embajadoresService: EmbajadoresService
  ) {
    this.formulario = this.fb.group({
      email: ['', Validators.required]
    });
  }

  async ngOnInit() {


    this.formulario.valueChanges.subscribe(() => {
      const isDirty = this.formulario.dirty;
      if (this.setFormDirtyStatus) {
        this.setFormDirtyStatus(isDirty);
      }
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
        referente_id: this.EmbajadorReferenteID,
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
