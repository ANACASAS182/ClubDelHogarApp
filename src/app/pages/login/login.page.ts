import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';

import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { TokenService } from 'src/app/services/token.service';
import { Usuario } from 'src/app/models/Usuario';

import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

import { PrefsStorage } from 'src/app/core/utils/prefs.storage';

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
  telefonoAlmacenado = '';
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
    private tokenService: TokenService,
    private prefs: PrefsStorage
  ) {
    this.loginForm = this.fb.group({
      telefono: [
        '+52 ',
        [
          Validators.required,
          // +52 y 10 dígitos (ej. +52 6561234567)
          Validators.pattern(/^\+52\s?\d{10}$/),
        ],
      ],
      password: ['', Validators.required],
      almacenarDatos: [false],
    });
  }

  private parseLoginError(err: any): string {
    const backendMsg =
      (typeof err?.error === 'string' ? err.error : err?.error?.message) ||
      err?.message ||
      '';
    if (err?.status === 401) return 'Teléfono o contraseña incorrectos';
    if (err?.status === 400) return backendMsg || 'Teléfono o contraseña incorrectos';
    if (err?.status === 403) return 'No tienes permisos para acceder.';
    if (err?.status === 0) return 'No hay conexión con el servidor. Verifica tu red.';
    return backendMsg || 'Error al iniciar sesión. Intenta de nuevo.';
  }

  // ---------- Persistencia ----------
  private async loadPrefs() {
    const tel = await this.prefs.get('telefonoAlmacenado');
    const p = await this.prefs.get('passwordAlmacenado');
    const n = await this.prefs.get('nombreAlmacenado');

    this.telefonoAlmacenado = tel;
    this.passwordAlmacenado = p;
    this.nombreAlmacenado = n;

    if (tel) {
      this.loginForm.patchValue({ telefono: tel || '+52 ', password: p || '' });
      this.rememberFlag = true;
    } else {
      this.rememberFlag = false;
    }
  }

  private async savePrefs(telefono: string, password: string, nombre: string) {
    await this.prefs.set('telefonoAlmacenado', telefono);
    await this.prefs.set('passwordAlmacenado', password);
    await this.prefs.set('nombreAlmacenado', nombre);
  }

  private async clearPrefs() {
    await this.prefs.remove('telefonoAlmacenado');
    await this.prefs.remove('passwordAlmacenado');
    await this.prefs.remove('nombreAlmacenado');
  }
  // -----------------------------------

  async ngOnInit() {
    await this.loadPrefs();

    // Guarda en caliente si la casilla está activa
    this.valueSub = this.loginForm.valueChanges.subscribe(async (v) => {
      if (this.rememberFlag) {
        await this.prefs.set('telefonoAlmacenado', v.telefono ?? '+52 ');
        await this.prefs.set('passwordAlmacenado', v.password ?? '');
      }
    });

    // Listeners teclado (solo nativo)
    if (Capacitor.isNativePlatform()) {
      this.kbShowWill = await Keyboard.addListener('keyboardWillShow', () => (this.tecladoVisible = true));
      this.kbShowDid = await Keyboard.addListener('keyboardDidShow', () => (this.tecladoVisible = true));
      this.kbHideWill = await Keyboard.addListener('keyboardWillHide', () => (this.tecladoVisible = false));
      this.kbHideDid = await Keyboard.addListener('keyboardDidHide', () => (this.tecladoVisible = false));
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

    const recordar = this.rememberFlag;

    this.formEnviado = true;
    this.iniciandoSesion = true;

    try {
      if (!this.loginForm.valid) {
        this.loginForm.markAllAsTouched();
        throw new Error('Completa los campos requeridos.');
      }

      const telefono = (this.loginForm.controls['telefono'].value || '').trim();
      const password = this.loginForm.controls['password'].value;

      const credenciales = {
        telefono, // 👈 el back lo ajustaremos a esto
        password,
      };

      // 1) Login
      const loginResp = await firstValueFrom(
        this.usuarioService.login(credenciales, true)
      );
      if (!loginResp?.success || !loginResp?.data) {
        throw new Error(loginResp?.message || 'No se pudo iniciar sesión.');
      }
      await this.tokenService.saveToken(loginResp.data);

      // 2) Perfil
      let nombre = '';
      let needsOnboarding = false;
      try {
        const pr = await firstValueFrom(this.usuarioService.getUsuario(true));
        if (pr?.success && pr?.data) {
          const u = pr.data as Usuario;

          // si rolesID === 1 lo sigues bloqueando, igual que antes
          if ((u as any).rolesID === 1) {
            this.hasError = true;
            this.messageError =
              'Este panel es solo para embajadores y socios. Visita el panel de administrador.';
            await this.tokenService.removeToken();
            localStorage.removeItem('usuario-actual');
            return;
          }

          nombre = `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim();
          needsOnboarding = !!(u as any)?.mostrarOnboarding;
        }
      } catch {
        // ignoramos fallo de perfil
      }

      // 3) Guardar / limpiar recuerdame
      if (recordar) {
        await this.savePrefs(telefono, password, nombre);
      } else {
        await this.clearPrefs();
      }

      // 4) Navegar según estado
      await this.router.navigate([needsOnboarding ? '/onboarding' : '/dashboard'], {
        replaceUrl: true,
      });

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

  // UI helpers
  toggleRemember() {
    this.rememberFlag = !this.rememberFlag;
  }

  get inicialesNombre(): string {
    const n = (this.nombreAlmacenado || '').trim();
    if (!n) return (this.telefonoAlmacenado || '+52').replace(/\D/g, '').slice(-2);
    const parts = n.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }

  async borrarDatosAlmacenados() {
    this.nombreAlmacenado = '';
    this.telefonoAlmacenado = '';
    this.passwordAlmacenado = '';
    await this.clearPrefs();
    this.loginForm.reset({
      telefono: '+52 ',
      password: '',
      almacenarDatos: false,
    });
    this.rememberFlag = false;
  }

  getControl(campo: string) {
    return this.loginForm.get(campo);
  }

  async onRememberChange(checked: boolean) {
    this.rememberFlag = checked;
    if (checked) {
      const telefono = this.loginForm.get('telefono')?.value || '+52 ';
      const password = this.loginForm.get('password')?.value || '';
      await this.savePrefs(telefono, password, this.nombreAlmacenado || '');
    } else {
      await this.clearPrefs();
    }
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }
}