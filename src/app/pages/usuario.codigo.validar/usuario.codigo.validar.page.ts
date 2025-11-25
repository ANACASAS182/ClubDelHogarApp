import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiBackServicesCDH, CodigoValidarDTO } from 'src/app/services/api.back.services.cdh/registro.service';

@Component({
  selector: 'app-usuario-codigo-validar',
  templateUrl: './usuario.codigo.validar.page.html',
  styleUrls: ['./usuario.codigo.validar.page.scss'],
  standalone: false
})
export class UsuarioCodigoValidarPage implements OnInit {

  form!: FormGroup;
  telefonoORcorreo: string = '';
  codigoGenerado!: string;
  loading = false;
  telefono: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cdhService: ApiBackServicesCDH
  ) {}

  ngOnInit() {
    // 👈 Usamos history.state, que siempre tiene el último state
    const data: any = history.state || {};

    console.log('[validar-codigo] state recibido:', data);

    this.telefonoORcorreo = data.telefono ?? data.correo ?? '';
    this.codigoGenerado   = data.codigoGenerado ?? '';

    if (this.telefonoORcorreo && !this.telefonoORcorreo.includes('@')) {
      this.telefono = this.telefonoORcorreo;
    }

    this.form = this.fb.group({
      codigo: ['', [
        Validators.required,
        Validators.pattern(/^\d{5}$/)
      ]]
    });
  }

  validarCodigo() {
    if (!this.telefonoORcorreo) {
      alert('No se recibió el teléfono o correo.');
      console.error('telefonoORcorreo vacío. state:', history.state);
      return;
    }

    // Si es teléfono, nos quedamos solo con dígitos
    let telefonoNormalizado: string | undefined = undefined;
    let correo: string | undefined = undefined;

    if (this.telefonoORcorreo.includes('@')) {
      correo = this.telefonoORcorreo;
    } else {
      telefonoNormalizado = this.telefonoORcorreo.replace(/\D/g, '');
      this.telefono = telefonoNormalizado;
    }

    const payload: CodigoValidarDTO = {
      telefono: telefonoNormalizado,
      correo,
      codigo: this.form.value.codigo + ''
    };

    this.cdhService.validarCodigo(payload).subscribe({
      next: (resp) => {
        console.log('Respuesta validar-codigo:', resp);
        alert('Código validado correctamente');

        this.router.navigate(['/usuario-crear-password'], {
          queryParams: { tel: telefonoNormalizado }
        });
      },
      error: (err) => {
        console.error('Error validar-codigo:', err);
        alert('Código incorrecto');
      }
    });
  }

  reenviarCodigo() {
    this.codigoGenerado = Math.floor(10000 + Math.random() * 90000).toString();
    console.log('Nuevo código:', this.codigoGenerado);
    alert('Nuevo código enviado');
  }

  regresar() {
    this.router.navigate(['/registro']);
  }
}