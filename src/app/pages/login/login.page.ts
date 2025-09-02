import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { LoginUsuarioDTO } from 'src/app/models/DTOs/LoginUsuarioDTO';
import { ToastController, ModalController } from '@ionic/angular';
import { TokenService } from 'src/app/services/token.service';
import { Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { OnboardingComponent } from 'src/app/modals/onboarding/onboarding.component';
import { Usuario } from 'src/app/models/Usuario';

import { Keyboard } from '@capacitor/keyboard';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { Prefs } from 'src/app/core/utils/prefs.util';   // ✅ nuestro wrapper

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit, OnDestroy {
  loginForm: FormGroup;
  hasError = false;
  messageError = '';
  rememberFlag = false; 

  nombreAlmacenado = '';
  correoAlmacenado = '';
  passwordAlmacenado = '';

  formEnviado = false;
  iniciandoSesion = false;
  tecladoVisible = false;

  private kbShowWill?: PluginListenerHandle;
  private kbShowDid?: PluginListenerHandle;
  private kbHideWill?: PluginListenerHandle;
  private kbHideDid?: PluginListenerHandle;
  private valueSub?: Subscription;

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
      almacenarDatos: [false], // opcional mantenerlo para layout; ya no se usa
    });
  }

  private parseLoginError(err: any): string {
    const backendMsg =
      (typeof err?.error === 'string' ? err.error : err?.error?.message) ||
      err?.message || '';

    if (err?.status === 401) return 'Correo o contraseña incorrectos';
    if (err?.status === 400) return backendMsg || 'Correo o contraseña incorrectos';
    if (err?.status === 403) return 'No tienes permisos para acceder.';
    if (err?.status === 0)   return 'No hay conexión con el servidor. Verifica tu red.';
    return backendMsg || 'Error al iniciar sesión. Intenta de nuevo.';
  }

  // ---------- Preferencias ----------
  private async loadPrefs() {
    const c = await Prefs.get('correoAlmacenado');
    const p = await Prefs.get('passwordAlmacenado');
    const n = await Prefs.get('nombreAlmacenado');

    this.correoAlmacenado = c;
    this.passwordAlmacenado = p;
    this.nombreAlmacenado = n;

    // prefill
      if (c) {
        this.loginForm.patchValue({ user: c || '', password: p || '' });
        this.rememberFlag = true;   // ✅ si hay datos, asumimos recordar activo
      } else {
        this.rememberFlag = false;
      }
    }

  private async savePrefs(email: string, password: string, nombre: string) {
    await Prefs.set('correoAlmacenado', email);
    await Prefs.set('passwordAlmacenado', password);
    await Prefs.set('nombreAlmacenado', nombre);
  }

  private async clearPrefs() {
    await Prefs.remove('correoAlmacenado');
    await Prefs.remove('passwordAlmacenado');
    await Prefs.remove('nombreAlmacenado');
  }
  // -----------------------------------

  async ngOnInit() {
    await this.loadPrefs();

    // guarda en caliente si la casilla está activa
    this.valueSub = this.loginForm.valueChanges.subscribe(async v => {
      if (this.rememberFlag) {
        await Prefs.set('correoAlmacenado',   v.user ?? '');
        await Prefs.set('passwordAlmacenado', v.password ?? '');
      }
    });

    if (Capacitor.isNativePlatform()) {
      this.kbShowWill = await Keyboard.addListener('keyboardWillShow', () => this.tecladoVisible = true);
      this.kbShowDid  = await Keyboard.addListener('keyboardDidShow',  () => this.tecladoVisible = true);
      this.kbHideWill = await Keyboard.addListener('keyboardWillHide', () => this.tecladoVisible = false);
      this.kbHideDid  = await Keyboard.addListener('keyboardDidHide',  () => this.tecladoVisible = false);
    }
  }

  ngOnDestroy() {
    this.valueSub?.unsubscribe();
    this.kbShowWill?.remove();
    this.kbShowDid?.remove();
    this.kbHideWill?.remove();
    this.kbHideDid?.remove();
  }

  async onSubmit() {
    if (this.formEnviado) return;

    const recordar = this.rememberFlag;   // ✅ usa la bandera, no el FormControl

    this.formEnviado = true;
    this.iniciandoSesion = true;

    try {
      if (!this.loginForm.valid) {
        this.loginForm.markAllAsTouched();
        throw new Error('Completa los campos requeridos.');
      }

      const credenciales = {
        email: this.loginForm.controls['user'].value,
        password: this.loginForm.controls['password'].value,
      };

      const loginResp = await firstValueFrom(this.usuarioService.login(credenciales, true));
      if (!loginResp?.success || !loginResp?.data) throw new Error(loginResp?.message || 'No se pudo iniciar sesión.');
      await this.tokenService.saveToken(loginResp.data);

      // perfil (igual)...
      let nombre = '';
      try {
        const pr = await firstValueFrom(this.usuarioService.getUsuario(true));
        if (pr?.success && pr?.data) {
          const u = pr.data as Usuario;
          if ((u as any).rolesID === 1) {
            this.hasError = true;
            this.messageError = 'Este panel es solo para embajadores y socios. Visita el panel de administrador.';
            await this.tokenService.removeToken();
            localStorage.removeItem('usuario-actual');
            return;
          }
          nombre = `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim();
        }
      } catch {}

      if (recordar) await this.savePrefs(credenciales.email, credenciales.password, nombre);
      else          await this.clearPrefs();

      await this.router.navigate(['/dashboard'], { replaceUrl: true });
      this.hasError = false; this.messageError = '';
    } catch (err: any) {
      this.hasError = true;
      this.messageError = this.parseLoginError(err);
    } finally {
      this.formEnviado = false;
      this.iniciandoSesion = false;
    }
  }

  toggleRemember() { this.rememberFlag = !this.rememberFlag; }

  get inicialesNombre(): string {
    const n = (this.nombreAlmacenado || '').trim();
    if (!n) return (this.correoAlmacenado || '?').slice(0, 2).toUpperCase();
    const parts = n.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }


  async borrarDatosAlmacenados() {
    this.nombreAlmacenado = '';
    this.correoAlmacenado = '';
    this.passwordAlmacenado = '';
    await this.clearPrefs();
    this.loginForm.reset({ user: '', password: '', almacenarDatos: false });
  }

  getControl(campo: string) { return this.loginForm.get(campo); }

  async onRememberChange(checked: boolean) {
    this.rememberFlag = checked;  // ✅ sincroniza la bandera
    if (checked) {
      const email = this.loginForm.get('user')?.value || '';
      const password = this.loginForm.get('password')?.value || '';
      await this.savePrefs(email, password, this.nombreAlmacenado || '');
    } else {
      await this.clearPrefs();
    }
  }
}