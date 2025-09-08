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
import { ReferidoRegistroModalComponent } from 'src/app/modals/referido.registro.modal/referido.registro.modal.component';


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

    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        const user = response.data;
        this.UsuarioID = user.id;

        this.empresaService.getAllEmpresasByUsuarioId(this.UsuarioID).subscribe({
          next: (data) => {
            this.empresas = data.data || [];
            this.cargandoEmpresas = false;

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
        this.cargandoEmpresas = false;
        this.cargandoPromociones = false;
      }
    });
  }

  seleccionarEmpresa(item: Empresa) {
    const id = Number((item as any)?.id);
    if (!id || id === this.empresaActualId) return;
    this.empresaActualId = id;
    this.cargarPromosEmpresa(id);
  }

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

    console.groupCollapsed('📦 Promos recibidas');
    (this.promociones as any[]).forEach((p,i) => {
      const lvlKeys = ['nivel_1','nivel_2','nivel_3','nivel_4','nivel_base','nivel_master',
                       'nivel1','nivel2','nivel3','nivel4','nivelInvitacion','nivelMaster'];
      const lvlSum = lvlKeys.reduce((a,k)=>a+(Number(p[k])||0),0);
      console.table([{
        idx: i,
        id: p.id ?? p.ID,
        nombre: p.nombre ?? p.Nombre,
        tipoComision: p.tipoComision ?? p.TipoComision,
        comisionCantidad: p.comisionCantidad ?? p.ComisionCantidad,
        comisionPorcentaje: p.comisionPorcentaje ?? p.ComisionPorcentaje,
        comisionStr: p.comision,
        precio: p.precio ?? p.Precio,
        lvlSum,
        keys: Object.keys(p).join(',')
      }]);
    });
    console.groupEnd();

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log(data);
    }
  }
  async abrirModalAgregar(promo: any) {
  let formDirty = false;

  const empresaId =
    promo?.empresaID ?? promo?.EmpresaID ?? promo?.empresaId ?? this.empresaActualId ?? 0;

  const modal = await this.modalCtrl.create({
    component: ReferidoRegistroModalComponent,
    cssClass: 'modal-registro-referido',
    componentProps: {
      empresaID: Number(empresaId),
      setFormDirtyStatus: (dirty: boolean) => (formDirty = dirty),
    },
    breakpoints: [0, 0.9],
    initialBreakpoint: 0.9
  });

  await modal.present();

  const { role, data } = await modal.onWillDismiss();
  if (role === 'confirm') {
    // aquí puedes refrescar la lista, mostrar toast, etc.
    // this.cargarPromosEmpresa(this.empresaActualId!);
    console.log('Referido guardado', data);
  }
}
}
