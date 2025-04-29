import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { CatalogoEstado } from 'src/app/models/CatalogoEstado';
import { CatalogoPais } from 'src/app/models/CatalogoPais';
import { FuenteOrigenDTO } from 'src/app/models/DTOs/FuenteOrigenDTO';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { UsuarioDTO } from 'src/app/models/DTOs/UsuarioDTO';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { matchValidator } from 'src/app/validators/custom.validators';

@Component({
  selector: 'app-usuario.registro',
  templateUrl: './usuario.registro.page.html',
  styleUrls: ['./usuario.registro.page.scss'],
  standalone: false
})
export class UsuarioRegistroPage implements OnInit {
  formularioRegistro: FormGroup;
  paises: CatalogoPais[] = [];
  estados: CatalogoEstado[] = [];
  fuentesOrigen: FuenteOrigenDTO[] = [];

  isNacional: boolean = false;
  formEnviado: boolean = false;

  //password
  password: string = '';
  passwordStrengthValue: number = 0;
  passwordStrengthColor: string = 'danger';
  passwordStrengthText: string = 'Seguridad BAJA'

  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private usuarioService: UsuarioService) {
    this.formularioRegistro = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pais: ['', Validators.required],
      ciudad: ['', Validators.required],
      estado: [''],
      estadoTexto: [''],
      telefono: ['', Validators.required],
      confirmTelefono: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      fuenteOrigen: ['', Validators.required],
    },
      {
        validators: [
          matchValidator('telefono', 'confirmTelefono'),
          matchValidator('password', 'confirmPassword'),
        ],
      });
  }

  ngOnInit() {
    const resolverData = this.route.snapshot.data['resolverData'];
    this.fuentesOrigen = resolverData.fuentesOrigen;
    this.paises = resolverData.paises;
    this.estados = resolverData.estados;

    //Mexico por default
    var mexico = this.paises.find(t => t.codigo == "MEX");
    this.formularioRegistro.patchValue({
      pais: mexico?.id
    });
    this.isNacional = true;
  }

  enviarFormulario() {
    if (this.formEnviado) return;

    this.formEnviado = true;
    if (!this.formularioRegistro.valid) {
      this.formularioRegistro.markAllAsTouched();
      this.formEnviado = false;
      return;
    }

    var user: UsuarioDTO = {
      apellidos: this.formularioRegistro.controls["apellido"].value,
      catalogoPaisID: this.formularioRegistro.controls["pais"].value,
      celular: this.formularioRegistro.controls["telefono"].value,
      ciudad: this.formularioRegistro.controls["ciudad"].value,
      confirmPassword: this.formularioRegistro.controls["confirmPassword"].value,
      email: this.formularioRegistro.controls["email"].value,
      estadoTexto: this.formularioRegistro.controls["estadoTexto"].value,
      fuenteOrigenID: this.formularioRegistro.controls["fuenteOrigen"].value,
      nombres: this.formularioRegistro.controls["nombre"].value,
      password: this.formularioRegistro.controls["password"].value,
      catalogoEstadoID: this.formularioRegistro.controls["estado"].value,
    }
    this.usuarioService.register(user).pipe(
      finalize(() => {
        this.formEnviado = false;
      })
    ).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        this.router.navigate(['/login'], { replaceUrl: true });
        this.toastController.create({
          message: "Registrado con exito. Inicia sesión con tu usuario.",
          duration: 3000,
          color: "success",
          position: 'top'
        }).then(toast => toast.present());   
      }
    });
  }


  onPaisChange(event: any) {
    const idSelected = event.detail.value;

    var pais = this.paises.find(t => t.id == idSelected);

    const estadoControl = this.formularioRegistro.get('estado');
    const estadoTextoControl = this.formularioRegistro.get('estadoTexto');

    if (pais!.codigo == "MEX") {
      this.isNacional = true;
      estadoControl?.setValidators([Validators.required]);
      estadoTextoControl?.clearValidators();
    } else {
      this.isNacional = false;
      estadoTextoControl?.setValidators([Validators.required]);
      estadoControl?.clearValidators();
    }

    estadoControl?.updateValueAndValidity();
    estadoTextoControl?.updateValueAndValidity();
  }


  getControl(campo: string) {
    return this.formularioRegistro.get(campo);
  }

  checkStrength() {
    const password = this.formularioRegistro.get('password')?.value;
    let strength = 0;
  
    if (!password) {
      this.passwordStrengthValue = 0;
      this.passwordStrengthColor = 'danger';
      this.passwordStrengthText = 'Seguridad BAJA';
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
        this.passwordStrengthText = 'Seguridad BAJA';
        break;
      case 3:
        this.passwordStrengthValue = 0.5;
        this.passwordStrengthColor = 'warning';
        this.passwordStrengthText = 'Seguridad MEDIA';
        break;
      case 4:
        this.passwordStrengthValue = 0.75;
        this.passwordStrengthColor = 'success';
        this.passwordStrengthText = 'Seguridad BUENA';
        break;
      case 5:
        this.passwordStrengthValue = 1.0;
        this.passwordStrengthColor = 'success';
        this.passwordStrengthText = 'Seguridad FUERTE';
        break;
    }
  }

}
