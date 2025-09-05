import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { Empresa } from 'src/app/models/Empresa';
import { Promocion } from 'src/app/models/Promocion';
import { Usuario } from 'src/app/models/Usuario';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';

import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { PromocionesService } from 'src/app/services/api.back.services/promociones.service';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';

import { PromocionComponent } from 'src/app/modals/promocion/promocion.component';

@Component({
  selector: 'app-empresas.network',
  templateUrl: './empresas.network.page.html',
  styleUrls: ['./empresas.network.page.scss'],
  standalone: false,
})
export class EmpresasNetworkPage implements OnInit {

  UsuarioID = 0;

  empresas: Empresa[] = [];
  promociones: Promocion[] = [];

  cargandoPromociones = true;
  cargandoEmpresas = true;

  // Empresa actualmente seleccionada (para filtrar)
  empresaActualId: number | null = null;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private empresaService: EmpresaService,
    private promocionesService: PromocionesService,
    private usuarioService: UsuarioService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.cargandoPromociones = true;
    this.cargandoEmpresas = true;

    // 1) Obtener usuario para tener el ID (si lo ocupas en otros lados)
    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        const user = response.data;
        this.UsuarioID = user.id;

        // 2) Cargar empresas del usuario
        this.empresaService.getAllEmpresasByUsuarioId(this.UsuarioID).subscribe({
          next: (data) => {
            this.empresas = data.data || [];
            this.cargandoEmpresas = false;

            // 3) Seleccionar por defecto la primera empresa y cargar sus promociones
            if (this.empresas.length > 0) {
              this.empresaActualId = Number(this.empresas[0].id);
              this.cargarPromosEmpresa(this.empresaActualId);
            } else {
              this.promociones = [];
              this.cargandoPromociones = false;
            }
          },
          error: _ => {
            this.empresas = [];
            this.cargandoEmpresas = false;
            this.promociones = [];
            this.cargandoPromociones = false;
          }
        });
      },
      error: _ => {
        // si fallara el usuario, no bloquees la UI
        this.cargandoEmpresas = false;
        this.cargandoPromociones = false;
      }
    });
  }

  // Cambiar empresa al tocar la tarjeta
  seleccionarEmpresa(item: Empresa) {
    const id = Number((item as any)?.id);
    if (!id || id === this.empresaActualId) return;
    this.empresaActualId = id;
    this.cargarPromosEmpresa(id);
  }

  // Pide SOLO las promos/productos de esa empresa (server-side filtered)
  private cargarPromosEmpresa(empresaId: number) {
    this.cargandoPromociones = true;
    this.promocionesService.GetPromocionesEmpresa(empresaId).subscribe({
      next: (data) => {
        this.promociones = data || [];
        this.cargandoPromociones = false;
      },
      error: _ => {
        this.promociones = [];
        this.cargandoPromociones = false;
      }
    });
  }

  verMas(item: any) {
    this.router.navigate(['/dashboard/empresa/detalle'], { queryParams: { empresaID: item.id } });
  }

  async abrirModalPromocion(promoSeleccionada: Promocion) {
    let formDirty = false;

    const modal = await this.modalCtrl.create({
      component: PromocionComponent,
      cssClass: 'modal-redondeado',
      componentProps: {
        promoSeleccionada,
        UsuarioID: this.UsuarioID,
        setFormDirtyStatus: (dirty: boolean) => (formDirty = dirty),
      },
      canDismiss: async () => {
        if (!formDirty) return true;
        const shouldClose = true;
        return shouldClose;
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      // si necesitas refrescar, puedes volver a llamar cargarPromosEmpresa(this.empresaActualId!)
      // this.empresaActualId && this.cargarPromosEmpresa(this.empresaActualId);
      console.log(data);
    }
  }
}