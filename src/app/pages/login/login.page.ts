import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { LoginUsuarioDTO } from 'src/app/models/DTOs/LoginUsuarioDTO';
import { ToastController } from '@ionic/angular';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { TokenService } from 'src/app/services/token.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  hasError: boolean = false;
  messageError: string = "";

  formEnviado: boolean = false;
  constructor(private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private toastController: ToastController,
    private tokenService: TokenService) {

    this.loginForm = this.fb.group({
      user: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

  }

  ngOnInit() {
  }

  onSubmit() {
    if (this.formEnviado) return;

    this.formEnviado = true;

    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      this.formEnviado = false;
      return;
    }

    let user: LoginUsuarioDTO = {
      email: this.loginForm.controls["user"].value,
      password: this.loginForm.controls["password"].value
    };

    this.usuarioService.login(user, true).pipe(
      finalize(() => {
        this.formEnviado = false;
      })
    ).subscribe({
      next: (res) => {
        this.tokenService.saveToken(res.data);
        this.router.navigate(['/dashboard']);
      },
      error: (res) => {
        this.hasError = true;
        this.messageError = res.error.message;
      }
    });
  }

  getControl(campo: string) {
    return this.loginForm.get(campo);
  }

}
