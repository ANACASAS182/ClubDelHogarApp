import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiBackServicesCDH } from 'src/app/services/api.back.services.cdh/registro.service';

@Component({
  selector: 'app-usuario-registro',
  templateUrl: './usuario.registro.page.html',
  styleUrls: ['./usuario.registro.page.scss'],
  standalone: false
})
export class UsuarioRegistroPage implements OnInit {

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdhService: ApiBackServicesCDH
  ) {}

  // --- Getters ---
  get usarCorreo(): boolean {
    return this.form.get('usarCorreo')?.value === true;
  }

  get formularioValido(): boolean {
    const usarCorreo = this.usarCorreo;

    if (usarCorreo) {
      return this.form.get('correo')?.valid || false;
    } else {
      return this.form.get('telefono')?.valid || false;
    }
  }

   // --- Methods ---

  ngOnInit() {
    this.form = this.fb.group({
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^\+?\d{10,15}$/)
      ]],
      usarCorreo: [false],
      correo: ['']
    });

    this.form.get('usarCorreo')?.valueChanges.subscribe(usar => {
      this.aplicarModoCorreo(usar);
    });
  }

  aplicarModoCorreo(usar: boolean) {

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

  continuar() {
    const usarCorreo = this.form.value.usarCorreo;

    const payload = {
      telefono: usarCorreo ? undefined : this.form.value.telefono,
      correo: usarCorreo ? this.form.value.correo : undefined,
      usarCorreo
    };

    this.cdhService.enviarCodigo(payload).subscribe({
      next: (resp) => {
        console.log('Código generado:', resp.data);

        this.router.navigate(['/validar-codigo'], {
          state: {
            telefono: payload.telefono ?? null,
            correo: payload.correo ?? null,
            codigoGenerado: resp.data
          }
        });
      },
      error: (err) => {
        alert('Error enviando el código');
        console.error(err);
      }
    });
  }

}