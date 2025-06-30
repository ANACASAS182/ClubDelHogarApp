import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { CatalogoEstado } from 'src/app/models/CatalogoEstado';
import { CatalogoPais } from 'src/app/models/CatalogoPais';
import { FuenteOrigenDTO } from 'src/app/models/DTOs/FuenteOrigenDTO';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { UsuarioRegistrarBasicoDTO } from 'src/app/models/DTOs/UsuarioDTO';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { matchValidator } from 'src/app/validators/custom.validators';
import { EmbajadoresService } from '../../services/api.back.services/embajadores.service';

@Component({
  selector: 'app-usuario.registro',
  templateUrl: './usuario.registro.page.html',
  styleUrls: ['./usuario.registro.page.scss'],
  standalone: false
})
export class UsuarioRegistroPage implements OnInit {

  codigo: string = ""; //codigo de invitacion
  nombreInvitador:string = "Nombre Embajador";
  EmbajadorReferenteId:number = 0;

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
    private embajadoresService:EmbajadoresService,
    private usuarioService: UsuarioService) {
    this.formularioRegistro = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    },
      {
        validators: [
          matchValidator('password', 'confirmPassword'),
        ],
      });
  }

  ngOnInit() {
    
    // Capturamos el parámetro 'codigo' de la URL
    this.route.paramMap.subscribe(params => {
      this.codigo = params.get('codigo') || '';
      console.log('Código recibido:', this.codigo);
      this.embajadoresService.GetDatosInvitacion(this.codigo).subscribe({
        next : (data) =>{
          this.nombreInvitador = data.nombreInvitador;
          this.formularioRegistro.controls['email'].setValue(data.correoElectronicoInvitacion);
          this.EmbajadorReferenteId = data.embajadorReferenteId;
        }
      });
    });

  }

  enviarFormulario() {
    if (this.formEnviado) return;

    this.formEnviado = true;
    if (!this.formularioRegistro.valid) {
      this.formularioRegistro.markAllAsTouched();
      this.formEnviado = false;
      return;
    }

    var user: UsuarioRegistrarBasicoDTO = {
      email: this.formularioRegistro.controls["email"].value,
      codigoInvitacion: this.codigo,
      password: this.formularioRegistro.controls["password"].value,
      }
    this.usuarioService.registerCodigoInvitacion(user).pipe(
      finalize(() => {
        this.formEnviado = false;
      })
    ).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        if(response.data){
          this.cuentaCreadaCorrectamente = 1;
        }
      }
    });
  }

  cuentaCreadaCorrectamente:number = 0;


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
