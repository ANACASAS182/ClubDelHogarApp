import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { UsuarioDTO } from 'src/app/models/DTOs/UsuarioDTO';
import { LoaderComponent } from "../../loader/loader.component";
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { CatalogoEstado } from 'src/app/models/CatalogoEstado';
import { CatalogosService } from 'src/app/services/api.back.services/catalogos.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  standalone:true,
  imports: [CommonModule, IonicModule, FormsModule, LoaderComponent],
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent  implements OnInit {

  estados: CatalogoEstado[] = [];


  @Input() usuarioId: number = 0;
  @Input() setFormDirtyStatus: ((dirty: boolean) => void) | undefined;
  
  constructor(
      private modalCtrl: ModalController,
      private usuarioService:UsuarioService,
      private catalogosService:CatalogosService
    ) { 
        this.usuarioOnboarding = {
          nombres: '',
    apellidos: '',
    celular: '',
    catalogoPaisID: 1,
    catalogoEstadoID: 1,
    ciudad: '',
    estadoTexto: '',
    //estos campos de abajo no son necesarios
    fuenteOrigenID: 2,
    email: '',
    password: '',
    confirmPassword:'',
    codigoInvitacion: '',
    UsuarioParent: 0,
    rolesId:3
        }
      }

  ngOnInit() {
    this.catalogosService.getCatalogoEstados().subscribe({
      next:(response) => {
        this.estados = response.data;
      }
    });
  }

  usuarioOnboarding?:UsuarioDTO;

  close() {
    window.location.reload();
  }
 
  estatusDatosA:number = 0;
  estatusDatosB:number = 0;

  GuardarDatosA(){
    this.estatusDatosA = 1;
    setTimeout(() => {
      this.usuarioOnboarding!.id = this.usuarioId;
    this.usuarioService.postOnboardingA(this.usuarioOnboarding!).subscribe({
      next :(data) =>{
        this.estatusDatosA = 2;
      },
      error:(err) =>{
        this.estatusDatosA = 0;
      }
    });
    }, 2000);  // Retraso de 1 segundo
    
  }

  GuardarDatosB(){
    this.estatusDatosB = 1;
    setTimeout(() => {
      this.usuarioOnboarding!.id = this.usuarioId;
    this.usuarioService.postOnboardingB(this.usuarioOnboarding!).subscribe({
      next :(data) =>{
        this.estatusDatosB = 2;
      },
      error:(err) =>{
        this.estatusDatosB = 0;
      }
    });
    }, 2000);  // Retraso de 1 segundo
    
  }

}
