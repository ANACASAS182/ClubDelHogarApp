import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { LoginUsuarioDTO } from 'src/app/models/DTOs/LoginUsuarioDTO';
import { ToastController, ModalController } from '@ionic/angular';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { TokenService } from 'src/app/services/token.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

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

  private parseLoginError(err: any): string {
  // Body puede venir como string o como objeto { message: "..."}
  const backendMsg =
    (typeof err?.error === 'string' ? err.error : err?.error?.message) ||
    err?.message || '';

  if (err?.status === 401) return 'Correo o contraseña incorrectos';
  if (err?.status === 400) {
    // Si tu API manda mensaje en 400, úsalo; si no, mapea a inválido
    return backendMsg || 'Correo o contraseña incorrectos';
  }
  if (err?.status === 403) return 'No tienes permisos para acceder.';
  if (err?.status === 0)   return 'No hay conexión con el servidor. Verifica tu red.';
  return backendMsg || 'Error al iniciar sesión. Intenta de nuevo.';
}


  async ngOnInit() {
    this.correoAlmacenado   = (await Preferences.get({ key: 'correoAlmacenado' })).value ?? '';
    this.passwordAlmacenado = (await Preferences.get({ key: 'passwordAlmacenado' })).value ?? '';
    this.nombreAlmacenado   = (await Preferences.get({ key: 'nombreAlmacenado' })).value ?? '';

    // ✅ Prefill del formulario (NO autologin a la brava)
    if (this.correoAlmacenado) {
      this.loginForm.patchValue({
        user: this.correoAlmacenado,
        password: this.passwordAlmacenado,
        almacenarDatos: true,
      });
    }

    // teclado (igual)
    this.tecladoVisible = false;
    Keyboard.addListener('keyboardWillShow', () => (this.tecladoVisible = true));
    Keyboard.addListener('keyboardDidShow', () => (this.tecladoVisible = true));
    Keyboard.addListener('keyboardWillHide', () => (this.tecladoVisible = false));
    Keyboard.addListener('keyboardDidHide', () => (this.tecladoVisible = false));
  }

   async onSubmit() {
    if (this.formEnviado) return;
    this.formEnviado = true;
    this.iniciandoSesion = true;

    try {
      if (!this.loginForm.valid) {
        this.loginForm.markAllAsTouched();
        throw new Error('Completa los campos requeridos.');
      }

      // ✅ SIEMPRE tomar lo que está en el formulario
      const credenciales: LoginUsuarioDTO = {
        email: this.loginForm.controls['user'].value,
        password: this.loginForm.controls['password'].value,
      };

      const almacenarDatosDespues: boolean = !!this.loginForm.controls['almacenarDatos'].value;

      // 1) Login → token
      const loginResp = await firstValueFrom(this.usuarioService.login(credenciales, true));
      if (!loginResp?.success || !loginResp?.data) {
        throw new Error(loginResp?.message || 'No se pudo iniciar sesión.');
      }

      // 2) Guardar token ANTES de pedir perfil
      await this.tokenService.saveToken(loginResp.data);

      // 3) Guardar preferencias si el usuario lo pidió
      if (almacenarDatosDespues) {
        await Preferences.set({ key: 'correoAlmacenado',   value: credenciales.email });
        await Preferences.set({ key: 'passwordAlmacenado', value: credenciales.password });
      } else {
        // Si no quiere guardar, limpiamos
        await Preferences.remove({ key: 'correoAlmacenado' });
        await Preferences.remove({ key: 'passwordAlmacenado' });
      }

      // 4) Perfil fresco
      try {
        const perfilResp = await firstValueFrom(this.usuarioService.getUsuario(true));
        if (perfilResp?.success && perfilResp?.data) {
          const u = perfilResp.data as Usuario;

          // 🚫 Bloquear admins
          if ((u as any).rolesID === 1) {
            this.hasError = true;
            this.messageError = 'Este panel es solo para embajadores y socios. Visita el panel de administrador.';
            // Limpia token y perfil para no dejar sesión activa
            await this.tokenService.removeToken();
            localStorage.removeItem('usuario-actual');
            return; // detenemos el flujo, no navegamos a dashboard
          }

          // si no es admin, guardamos nombre para el saludo
          const nombre = `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim();
          await Preferences.set({ key: 'nombreAlmacenado', value: nombre });
        } else {
          await Preferences.remove({ key: 'nombreAlmacenado' });
        }
      } catch {
        // si falla, no bloquea
      }

      // 5) Navegar sin dejar pila
      await this.router.navigate(['/dashboard'], { replaceUrl: true });

      this.hasError = false;
      this.messageError = '';
    } catch (err: any) {
      this.hasError = true;
      this.messageError = this.parseLoginError(err);
    } finally {
      this.formEnviado = false;
      this.iniciandoSesion = false;
    }
  }

  async borrarDatosAlmacenados() {
    this.nombreAlmacenado = '';
    this.correoAlmacenado = '';
    this.passwordAlmacenado = '';
    await Preferences.remove({ key: 'correoAlmacenado' });
    await Preferences.remove({ key: 'passwordAlmacenado' });
    await Preferences.remove({ key: 'nombreAlmacenado' });
    // opcional: limpia también el form
    this.loginForm.reset({ user: '', password: '', almacenarDatos: false });
  }

  getControl(campo: string) {
    return this.loginForm.get(campo);
  }
}