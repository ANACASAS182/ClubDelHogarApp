import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { PasswordRecoveryDTO } from 'src/app/models/DTOs/PasswordRecoveryDTO';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';

@Component({
  selector: 'app-usuario.password.recovery',
  templateUrl: './usuario.password.recovery.page.html',
  styleUrls: ['./usuario.password.recovery.page.scss'],
  standalone: false
})
export class UsuarioPasswordRecoveryPage implements OnInit {
  passwordResetForm: FormGroup;
  hasError: boolean = false;
  messageError: string = "";
  correoEnviado: boolean = false;
  title: string = "Recupera tu contraseña";
  formEnviado: boolean = false;
  constructor(private fb: FormBuilder, private usuarioService: UsuarioService) {
    this.passwordResetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
  }

  getControl(campo: string) {
    return this.passwordResetForm.get(campo)
  }

  onSubmit() {
    if (this.formEnviado) return;

    this.formEnviado = true;

    if (this.passwordResetForm.invalid) {
      this.passwordResetForm.markAllAsTouched();
      this.formEnviado = false;
      return;
    }
    this.hasError = false;
    this.messageError = "";

    var model: PasswordRecoveryDTO = { email: this.passwordResetForm.controls["email"].value }

    this.usuarioService.passwordRecovery(model, true).pipe(
      finalize(() => {
        this.formEnviado = false;
      })
    ).subscribe({
      next: (response) => {
        if (response.data) {
          this.correoEnviado = true;
          this.title = "Revise su bandeja de entrada";
        } else {
          this.hasError = true;
          this.messageError = response.message;
        }
      },
      error: (response) => {
        this.hasError = true;
        this.messageError = response.error.message;
      }
    });

  }

}
