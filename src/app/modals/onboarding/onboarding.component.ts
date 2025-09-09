import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { UsuarioDTO } from 'src/app/models/DTOs/UsuarioDTO';
import { LoaderComponent } from '../../loader/loader.component';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { CatalogoEstado } from 'src/app/models/CatalogoEstado';
import { CatalogosService } from 'src/app/services/api.back.services/catalogos.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, LoaderComponent],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit {
  estados: CatalogoEstado[] = [];
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

  estatusDatosA = 0;
  estatusDatosB = 0;

  constructor(
    private usuarioService: UsuarioService,
    private catalogosService: CatalogosService
  ) {}

  async ngOnInit() {
    // catálogos
    this.catalogosService.getCatalogoEstados().subscribe({
      next: (r) => (this.estados = r.data || []),
    });

    // ⚠️ Obtener el usuario logueado para traer su ID y precargar datos
    try {
      const resp = await firstValueFrom(this.usuarioService.getUsuarioLogeado(true));
      const u: any = resp?.data;

      // setea id y valores actuales (si hay)
      this.usuarioOnboarding.id = u?.id ?? u?.ID ?? u?.usuarioID; // por si cambia el casing
      this.usuarioOnboarding.nombres = u?.nombres ?? '';
      this.usuarioOnboarding.apellidos = u?.apellidos ?? '';
      this.usuarioOnboarding.celular = u?.celular ?? '';
      this.usuarioOnboarding.catalogoPaisID = u?.catalogoPaisID ?? undefined;
      this.usuarioOnboarding.catalogoEstadoID = u?.catalogoEstadoID ?? undefined;
      this.usuarioOnboarding.ciudad = u?.ciudad ?? '';
      this.usuarioOnboarding.estadoTexto = u?.estadoTexto ?? '';
    } catch {
      // si falla, deja al usuario llenar; pero sin ID no habrá update
    }
  }

  close() {
    // mejor navegar al dashboard; recargar es tosco
    window.location.href = '/dashboard';
  }

  GuardarDatosA() {
    if (!this.usuarioOnboarding.id) {
      this.estatusDatosA = 0;
      return;
    }
    this.estatusDatosA = 1;
    this.usuarioService.postOnboardingA(this.usuarioOnboarding).subscribe({
      next: () => (this.estatusDatosA = 2),
      error: () => (this.estatusDatosA = 0),
    });
  }

  GuardarDatosB() {
    if (!this.usuarioOnboarding.id) {
      this.estatusDatosB = 0;
      return;
    }
    this.estatusDatosB = 1;
    this.usuarioService.postOnboardingB(this.usuarioOnboarding).subscribe({
      next: () => (this.estatusDatosB = 2),
      error: () => (this.estatusDatosB = 0),
    });
  }
}