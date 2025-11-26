import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiBackServicesCDH, CodigoValidarDTO } from 'src/app/services/api.back.services.cdh/registro.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-usuario-registro',
  templateUrl: './usuario.registro.page.html',
  styleUrls: ['./usuario.registro.page.scss'],
  standalone: false
})
export class UsuarioRegistroPage implements OnInit {

  form!: FormGroup;
  step = 1;
  loading = false;

  // datos que vamos arrastrando entre pasos
  telefonoORcorreo = '';
  telefonoNormalizado?: string;
  codigoGenerado?: string;

  // 🔹 Mixin para que NUNCA rompa el layout de Ionic
  private swal = Swal.mixin({
    heightAuto: false,              // <- evita que toque el body y deje todo negro
    confirmButtonText: 'Aceptar',
    buttonsStyling: true
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdhService: ApiBackServicesCDH
  ) {}

  // === Helpers de SweetAlert centralizados ===
  private showAlert(icon: SweetAlertIcon, title: string, text: string) {
    try {
      this.swal.fire({ icon, title, text });
    } catch (e) {
      // fallback por si SweetAlert truena por algo raro
      alert(`${title}\n\n${text}`);
    }
  }

  private showSuccess(title: string, text: string) {
    this.showAlert('success', title, text);
  }

  private showError(text: string, title: string = 'Ups…') {
    this.showAlert('error', title, text);
  }

  private showInfo(title: string, text: string) {
    this.showAlert('info', title, text);
  }

  // --- Getters de comodidad ---

  get usarCorreo(): boolean {
    return this.form.get('usarCorreo')?.value === true;
  }

  get puedeContinuarPaso1(): boolean {
    if (this.usarCorreo) {
      return this.form.get('correo')?.valid || false;
    }
    return this.form.get('telefono')?.valid || false;
  }

  get puedeContinuarPaso2(): boolean {
    return this.form.get('codigo')?.valid || false;
  }

  get puedeGuardarPassword(): boolean {
    const pass  = this.form.get('password')?.value || '';
    const pass2 = this.form.get('password2')?.value || '';
    return pass.length >= 6 && pass === pass2;
  }

  ngOnInit() {
    this.form = this.fb.group({
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^\+?\d{10,15}$/)
      ]],
      usarCorreo: [false],
      correo: [''],

      codigo: ['', [
        Validators.required,
        Validators.pattern(/^\d{5}$/)
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      password2: ['', [
        Validators.required
      ]]
    });

    this.form.get('usarCorreo')?.valueChanges.subscribe(usar => {
      this.aplicarModoCorreo(usar);
    });

    this.aplicarModoCorreo(this.usarCorreo);
  }

  private aplicarModoCorreo(usar: boolean) {
    if (usar) {
      this.form.get('telefono')?.setValue('');
      this.form.get('telefono')?.clearValidators();
      this.form.get('telefono')?.updateValueAndValidity();

      this.form.get('correo')?.setValidators([Validators.required, Validators.email]);
      this.form.get('correo')?.updateValueAndValidity();
    } else {
      this.form.get('correo')?.setValue('');
      this.form.get('correo')?.clearValidators();
      this.form.get('correo')?.updateValueAndValidity();

      this.form.get('telefono')?.setValidators([
        Validators.required,
        Validators.pattern(/^\+?\d{10,15}$/)
      ]);
      this.form.get('telefono')?.updateValueAndValidity();
    }
  }

  // ===== PASO 1 =====
  continuarPaso1() {
    if (!this.puedeContinuarPaso1) { return; }

    const usarCorreo = this.usarCorreo;
    const telefono   = usarCorreo ? undefined : this.form.value.telefono;
    const correo     = usarCorreo ? this.form.value.correo : undefined;

    const payload = { telefono, correo, usarCorreo };

    this.loading = true;
    this.cdhService.enviarCodigo(payload).subscribe({
      next: (resp) => {
        this.loading = false;
        console.log('Código generado:', resp.data);

        this.telefonoORcorreo = telefono ?? correo ?? '';
        this.codigoGenerado   = resp.data;

        if (telefono) {
          this.telefonoNormalizado = (telefono + '').replace(/\D/g, '');
        } else {
          this.telefonoNormalizado = undefined;
        }

        this.showInfo('Código enviado', 'Te enviamos un código para continuar con tu registro.');
        this.step = 2;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.showError('Hubo un problema al enviar el código. Intenta de nuevo.');
      }
    });
  }

  // ===== PASO 2 =====
  validarCodigo() {
    if (!this.telefonoORcorreo) {
      console.error('telefonoORcorreo vacío.');
      this.showError('No se recibió el teléfono o correo.');
      return;
    }

    let telefonoNormalizado: string | undefined = undefined;
    let correo: string | undefined = undefined;

    if (this.telefonoORcorreo.includes('@')) {
      correo = this.telefonoORcorreo;
    } else {
      telefonoNormalizado = this.telefonoORcorreo.replace(/\D/g, '');
      this.telefonoNormalizado = telefonoNormalizado;
    }

    const payload: CodigoValidarDTO = {
      telefono: telefonoNormalizado,
      correo,
      codigo: this.form.value.codigo + ''
    };

    this.loading = true;
    this.cdhService.validarCodigo(payload).subscribe({
      next: (resp) => {
        this.loading = false;
        console.log('Respuesta validar-codigo:', resp);
        this.showSuccess('Código validado', 'Ahora crea tu contraseña para finalizar el registro.');
        this.step = 3;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error validar-codigo:', err);
        this.showError('El código es incorrecto o ha expirado. Verifica e inténtalo de nuevo.');
      }
    });
  }

  reenviarCodigo() {
    if (!this.telefonoORcorreo) { return; }

    const usarCorreo = this.telefonoORcorreo.includes('@');
    const telefono   = usarCorreo ? undefined : this.telefonoORcorreo;
    const correo     = usarCorreo ? this.telefonoORcorreo : undefined;

    const payload = { telefono, correo, usarCorreo };

    this.loading = true;
    this.cdhService.enviarCodigo(payload).subscribe({
      next: (resp) => {
        this.loading = false;
        this.codigoGenerado = resp.data;
        this.showInfo('Nuevo código enviado', 'Revisa nuevamente tu WhatsApp o correo.');
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.showError('No pudimos reenviar el código. Intenta más tarde.');
      }
    });
  }

  volverPaso1() {
    this.step = 1;
  }

  // ===== PASO 3 =====
  guardarPassword() {
    if (!this.puedeGuardarPassword) {
      this.showError('Revisa tu contraseña. Debe coincidir y tener al menos 6 caracteres.');
      return;
    }

    const password = this.form.value.password;
    const telefono = this.telefonoNormalizado || '';

    const payload = {
      telefono,
      password
    };

    this.loading = true;
    this.cdhService.crearPassword(payload).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess('Cuenta creada', 'Tu contraseña se guardó correctamente.');
        if (telefono) {
          localStorage.setItem('cdh_tel', telefono);
        }
        this.router.navigate(['/dashboard/network']);
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.showError('Ocurrió un error al guardar tu contraseña. Intenta nuevamente.');
      }
    });
  }

  volverPaso2() {
    this.step = 2;
  }

  irALogin() {
    this.router.navigate(['/login']);
  }
}