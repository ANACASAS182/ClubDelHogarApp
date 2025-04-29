import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { BancoUsuario } from 'src/app/models/BancoUsuario';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { BancoUsuarioService } from 'src/app/services/api.back.services/banco.usuario.service';

@Component({
  selector: 'app-banco.usuario.registro.modal',
  templateUrl: './banco.usuario.registro.modal.component.html',
  styleUrls: ['./banco.usuario.registro.modal.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class BancoUsuarioRegistroModalComponent implements OnInit {

  formulario: FormGroup;
  btnName: string = "AGREGAR";
  title: string = "AGREGAR";
  @Input() id?: number = undefined;

  formEnviado: boolean = false;

  constructor(private fb: FormBuilder,
    private bancoUsuarioService: BancoUsuarioService,
    private toastController: ToastController,
    private modalCtrl: ModalController) {
    this.formulario = this.fb.group({
      titular: ["", Validators.required],
      banco: ["", Validators.required],
      cuenta: ["", Validators.required]
    });
  }

  ngOnInit() {
    if (this.id != undefined) {
      this.btnName = "GUARDAR";
      this.title = "MODIFICAR";
      this.bancoUsuarioService.getBancoByID(this.id).subscribe({
        next: (response: GenericResponseDTO<BancoUsuario>) => {
          this.formulario.patchValue({
            titular: response.data.nombreTitular,
            banco: response.data.nombreBanco,
            cuenta: response.data.numeroCuenta
          });
        }
      });
    }
  }

  enviarFormulario() {
    if (this.formEnviado) return;

    this.formEnviado = true;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.formEnviado = false;
      return;
    }

    var model: BancoUsuario = {
      nombreBanco: this.formulario.controls["banco"].value,
      nombreTitular: this.formulario.controls["titular"].value,
      numeroCuenta: this.formulario.controls["cuenta"].value
    };

    if (this.id != undefined) {
      model.id = this.id;
    }

    this.bancoUsuarioService.save(model).pipe(
      finalize(() => {
        this.formEnviado = false;
      })
    ).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        if (response) {
          this.toastController.create({
            message: "Tarjeta guardada.",
            duration: 3000,
            color: "success",
            position: 'top'
          }).then(toast => toast.present());
          this.modalCtrl.dismiss(true);
        }
      }
    });

  }

  getControl(name: string) {
    return this.formulario.get(name);
  }

  close(){
    this.modalCtrl.dismiss();
  }

}
