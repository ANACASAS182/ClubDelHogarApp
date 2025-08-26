import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { LoginUsuarioDTO } from 'src/app/models/DTOs/LoginUsuarioDTO';
import { ToastController, ModalController } from '@ionic/angular';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { TokenService } from 'src/app/services/token.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

// ⚠️ Usa la ruta real de tu modal (sin '../../'). Si tu archivo se llama distinto o cambia el casing, ajústalo.
import { OnboardingComponent } from 'src/app/modals/onboarding/onboarding.component';
import { Usuario } from 'src/app/models/Usuario';

import { Keyboard } from '@capacitor/keyboard';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  hasError = false;
  messageError = '';

  nombreAlmacenado = '';
  correoAlmacenado = '';
  passwordAlmacenado = '';

  formEnviado = false;
  iniciandoSesion = false;
  tecladoVisible = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private toastController: ToastController,
    private tokenService: TokenService,
    private modalCtrl: ModalController
  ) {
    this.loginForm = this.fb.group({
      user: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      almacenarDatos: [false],
    });
  }

  async borrarDatosAlmacenados() {
    this.nombreAlmacenado = '';
    this.correoAlmacenado = '';
    this.passwordAlmacenado = '';
    await Preferences.clear();
  }

  async ngOnInit() {
    this.correoAlmacenado = (await Preferences.get({ key: 'correoAlmacenado' })).value ?? '';
    this.passwordAlmacenado = (await Preferences.get({ key: 'passwordAlmacenado' })).value ?? '';
    this.nombreAlmacenado = (await Preferences.get({ key: 'nombreAlmacenado' })).value ?? '';

    this.tecladoVisible = false;
    Keyboard.addListener('keyboardWillShow', () => (this.tecladoVisible = true));
    Keyboard.addListener('keyboardDidShow', () => (this.tecladoVisible = true));
    Keyboard.addListener('keyboardWillHide', () => (this.tecladoVisible = false));
    Keyboard.addListener('keyboardDidHide', () => (this.tecladoVisible = false));
  }

  onSubmit() {
    if (this.formEnviado) return;

    this.formEnviado = true;
    this.iniciandoSesion = true;

    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      this.formEnviado = false;
      this.iniciandoSesion = false;
      return;
    }

    const almacenarDatosDespues: boolean = this.loginForm.controls['almacenarDatos'].value;

    let user: LoginUsuarioDTO = {
      email: this.loginForm.controls['user'].value,
      password: this.loginForm.controls['password'].value,
    };

    if (this.correoAlmacenado !== '') {
      user = {
        email: this.correoAlmacenado,
        password: this.passwordAlmacenado,
      };
    }

    this.usuarioService
      .login(user, true)
      .pipe(
        finalize(() => {
          this.formEnviado = false;
          this.iniciandoSesion = false;
        })
      )
      .subscribe({
        next: async (res: GenericResponseDTO<string>) => {
          if (almacenarDatosDespues) {
            await Preferences.set({ key: 'correoAlmacenado', value: user.email });
            await Preferences.set({ key: 'passwordAlmacenado', value: user.password });
          }

          // 1) Guarda el token
          this.tokenService.saveToken(res.data);

          // 2) Trae el usuario logeado y decide si abrir Onboarding
          this.usuarioService.getUsuario(true).subscribe({
            next: async (resp: GenericResponseDTO<Usuario>) => {
              const u = resp.data;
              if (!u) {
                this.router.navigate(['/dashboard']);
                return;
              }

              const faltaA = !u.nombres || !u.apellidos || !u.celular;
              const faltaB = !u.catalogoEstadoID || !u.ciudad;

              if ((u as any).mostrarOnboarding || faltaA || faltaB) {
                const modal = await this.modalCtrl.create({
                  component: OnboardingComponent,
                  componentProps: { usuarioId: (u as any).id },
                });
                await modal.present();
              } else {
                this.router.navigate(['/dashboard']);
              }
            },
            error: () => this.router.navigate(['/dashboard']),
          });
        },
        error: (err: any) => {
          this.hasError = true;
          this.messageError = err?.error?.message ?? 'Error al iniciar sesión';
        },
      });
  }

  getControl(campo: string) {
    return this.loginForm.get(campo);
  }
}