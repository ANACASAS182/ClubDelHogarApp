import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { PasswordResetDTO } from 'src/app/models/DTOs/PasswordResetDTO';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { matchValidator } from 'src/app/validators/custom.validators';

@Component({
  selector: 'app-usuario.password.reset',
  templateUrl: './usuario.password.reset.page.html',
  styleUrls: ['./usuario.password.reset.page.scss'],
  standalone: false
})
export class UsuarioPasswordResetPage implements OnInit {
  hasError: boolean = false;
  messageError: string = "";
  passwordResetForm: FormGroup;
  token: string = "";

  formEnviado: boolean = false;
  //password
  password: string = '';
  passwordStrengthValue: number = 0;
  passwordStrengthColor: string = 'danger';
  passwordStrengthText: string = 'Débil'

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private toastController: ToastController, private usuarioService: UsuarioService) {

    this.passwordResetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
      {
        validators: [
          matchValidator('password', 'confirmPassword'),
        ],
      });

    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.toastController.create({
        message: "No se proporciono token",
        duration: 3000,
        color: "warning",
        position: 'top'
      }).then(toast => toast.present());

      this.router.navigateByUrl("/login");
    } else {
      this.token = token;
    }

  }

  ngOnInit() {
  }

  onSubmit() {
    if (this.formEnviado) return;

    this.formEnviado = true;

    if (this.passwordResetForm.invalid) {
      this.passwordResetForm.markAllAsTouched();
      this.formEnviado = false;
      return;
    }

    let model: PasswordResetDTO = {
      newPassword: this.passwordResetForm.controls["password"].value,
      confirmNewPassword: this.passwordResetForm.controls["confirmPassword"].value,
      token: this.token
    }

    this.usuarioService.passwordReset(model, true).pipe(
      finalize(() => {
        this.formEnviado = false;
      })
    ).subscribe({
      next: (response) => {
        this.toastController.create({
          message: "Contraseña actualizada con exito.",
          duration: 3000,
          color: "success",
          position: 'bottom'
        }).then(toast => toast.present());

        this.router.navigateByUrl("/login");

      },
      error: (error) => {
        this.hasError = true;
        this.messageError = error.error.message;
      }
    })

  }


  getControl(name: string) {
    return this.passwordResetForm.get(name);
  }

  checkStrength() {
    const password = this.passwordResetForm.get('password')?.value;
    let strength = 0;

    if (!password) {
      this.passwordStrengthValue = 0;
      this.passwordStrengthColor = 'danger';
      this.passwordStrengthText = 'Débil';
      return;
    }

    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) strength += 1;
    if (password.length >= 10) strength++;

    switch (strength) {
      case 0:
      case 1:
      case 2:
        this.passwordStrengthValue = 0.25;
        this.passwordStrengthColor = 'danger';
        this.passwordStrengthText = 'Débil';
        break;
      case 3:
        this.passwordStrengthValue = 0.5;
        this.passwordStrengthColor = 'warning';
        this.passwordStrengthText = 'Media';
        break;
      case 4:
        this.passwordStrengthValue = 0.75;
        this.passwordStrengthColor = 'success';
        this.passwordStrengthText = 'Buena';
        break;
      case 5:
        this.passwordStrengthValue = 1.0;
        this.passwordStrengthColor = 'success';
        this.passwordStrengthText = 'Fuerte';
        break;
    }
  }

}
