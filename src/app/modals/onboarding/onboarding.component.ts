import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { UsuarioDTO } from 'src/app/models/DTOs/UsuarioDTO';
import { LoaderComponent } from '../../loader/loader.component';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, LoaderComponent],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit {

  usuarioOnboarding: UsuarioDTO = {
    id: undefined,
    nombres: '',
    apellidos: '',
    celular: '',
    catalogoPaisID: undefined,
    catalogoEstadoID: undefined,
    ciudad: '',
    estadoTexto: '',
    fuenteOrigenID: 2,
    email: '',
    password: '',
    confirmPassword: '',
    codigoInvitacion: '',
    UsuarioParent: undefined,
    rolesId: 3,
  };

  // solo manejamos A (0 = editable, 1 = guardando, 2 = terminado)
  estatusDatosA = 0;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const resp = await firstValueFrom(this.usuarioService.getUsuario(true));
      const u: any = resp?.data;

      this.usuarioOnboarding.id              = u?.id ?? u?.ID ?? u?.usuarioID;
      this.usuarioOnboarding.nombres         = u?.nombres ?? '';
      this.usuarioOnboarding.apellidos       = u?.apellidos ?? '';
      this.usuarioOnboarding.celular         = u?.celular ?? '';
      this.usuarioOnboarding.catalogoPaisID  = u?.catalogoPaisID ?? undefined;
      this.usuarioOnboarding.catalogoEstadoID= u?.catalogoEstadoID ?? undefined;
      this.usuarioOnboarding.ciudad          = u?.ciudad ?? '';
      this.usuarioOnboarding.estadoTexto     = u?.estadoTexto ?? '';
    } catch {
      // si falla, que el usuario lo llene a mano (menos celular, que va bloqueado)
    }
  }

  close() {
    this.router.navigate(['/dashboard/network'], { replaceUrl: true });
  }

  GuardarDatosA() {
    if (!this.usuarioOnboarding.id) {
      this.estatusDatosA = 0;
      return;
    }

    this.estatusDatosA = 1;

    // si quieres forzar estado / ciudad fijos, puedes setearlos aquí:
    // this.usuarioOnboarding.catalogoEstadoID = 999;
    // this.usuarioOnboarding.ciudad = 'Ciudad fija';

    this.usuarioService.postOnboardingA(this.usuarioOnboarding).subscribe({
      next: () => (this.estatusDatosA = 2),
      error: () => (this.estatusDatosA = 0),
    });
  }
}