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
  esSocio = false;

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
        if (!user) {
          this.cargandoEmpresas = false;
          this.cargandoPromociones = false;
          return;
        }

        this.UsuarioID = user.id;

        // ⚠️ roles a prueba de balas
        const rolId = Number(
          (user as any)?.rolesID ?? (user as any)?.RolesID ??
          (user as any)?.rolID   ?? (user as any)?.rolId   ??
          (user as any)?.rol?.id ?? (user as any)?.rol     ?? 0
        );
        this.esSocio = (rolId === 2);
        console.log('[EmpresasNetwork] rolId=', rolId, 'esSocio=', this.esSocio);

        // Empresas del usuario
        this.empresaService.getAllEmpresasByUsuarioId(this.UsuarioID).subscribe({
          next: (data) => {
            const crudas = (data as any)?.data ?? data ?? [];

            // 🔧 normaliza id en todos los elementos (todas las variantes)
            this.empresas = (crudas || []).map((e: any) => {
              const anyId =
                e?.id ?? e?.ID ?? e?.Id ?? e?.iD ??
                e?.empresaID ?? e?.EmpresaID ?? e?.empresaId ?? e?.EmpresaId ??
                e?.empresa_id ?? e?.Empresa_id ?? e?.Empresa_id;
              const id = Number(anyId) || 0;
              return { ...e, id };
            });

            console.log('[EmpresasNetwork] empresas[0]=', this.empresas[0]);

            this.cargandoEmpresas = false;

            // Toma la primera con id válido > 0
            const primeraConId = this.empresas.find(x => Number((x as any)?.id) > 0);
            if (primeraConId) {
              this.empresaActualId = Number((primeraConId as any).id);
              console.log('[EmpresasNetwork] empresaActualId =', this.empresaActualId);
              this.cargarPromosEmpresa(this.empresaActualId);
            } else {
              console.warn('[EmpresasNetwork] ninguna empresa con id válido');
              this.promociones = [];
              this.cargandoPromociones = false;
            }

            // 👇 después de tener usuario/empresas, revisamos si hay un referido pendiente
            this.checkPendingReferral();
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
    const id = this.getEmpresaId(item);
    if (!id || id <= 0) return;
    if (id === this.empresaActualId) return;
    this.empresaActualId = id;
    this.cargarPromosEmpresa(id);
  }

  // helper robusto
  private getEmpresaId(e: any): number {
    return Number(
      e?.id ?? e?.ID ?? e?.Id ?? e?.iD ??
      e?.empresaID ?? e?.EmpresaID ?? e?.empresaId ?? e?.EmpresaId ??
      e?.empresa_id ?? e?.Empresa_id ?? e?.Empresa_id ?? 0
    ) || 0;
  }

  // nuevo helper para obtener el producto de la promo
  private getProductoId(p: any): number {
    return Number(
      p?.productoID ?? p?.ProductoID ??
      p?.productoId ?? p?.producto_id ??
      p?.id ?? p?.ID ?? 0
    ) || 0;
  }

  private cargarPromosEmpresa(empresaId: number) {
    if (!empresaId || empresaId <= 0) {
      console.warn('[EmpresasNetwork] cargarPromosEmpresa: empresaId inválido', empresaId);
      this.promociones = [];
      this.cargandoPromociones = false;
      return;
    }

    this.cargandoPromociones = true;
    this.promocionesService.GetPromocionesEmpresa(empresaId).subscribe({
      next: (data) => {
        // Tolera respuesta plana ([]) o envuelta (GenericResponseDTO)
        const payload: any = data as any;
        const arr = Array.isArray(payload?.data) ? payload.data
                  : Array.isArray(payload) ? payload
                  : [];
        this.promociones = arr || [];
        this.cargandoPromociones = false;
      },
      error: _ => {
        this.promociones = [];
        this.cargandoPromociones = false;
      }
    });
  }

  verMas(item: any) {
    const id = this.getEmpresaId(item);
    this.router.navigate(['/dashboard/empresa/detalle'], { queryParams: { empresaID: id } });
  }

  ensureDataUrl(b64?: string): string {
    if (!b64) return '';
    const clean = (b64 || '').trim().replace(/\s+/g, ''); // quita CR/LF/espacios
    if (clean.startsWith('data:')) return clean;
    return `data:image/png;base64,${clean}`;
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
    await modal.onDidDismiss();
  }

  // 👇 aquí conectamos CARD → registro / referidos
  async abrirModalAgregar(promo: any) {
    let formDirty = false;

    const empresaId =
      promo?.empresaID ?? promo?.EmpresaID ?? promo?.empresaId ??
      this.empresaActualId ?? 0;

    const productoId = this.getProductoId(promo);

    const tel = localStorage.getItem('cdh_tel');

    // Si NO está registrado (no tiene telefono guardado) → guardamos pendiente y mandamos a registro
    if (!tel) {
      localStorage.setItem(
        'cdh_pending_ref',
        JSON.stringify({
          empresaId: Number(empresaId) || 0,
          productoId: Number(productoId) || 0,
        })
      );

      this.router.navigate(['/registro'], {
        queryParams: {
          productoID: productoId || null
        }
      });

      return;
    }

    // Si ya está registrado → abrimos el modal de referido normal, con empresa/producto preseleccionados
    const modal = await this.modalCtrl.create({
      component: ReferidoRegistroModalComponent,
      cssClass: 'modal-registro-referido',
      componentProps: {
        empresaID: Number(empresaId),
        productoID: Number(productoId) || 0,
        setFormDirtyStatus: (dirty: boolean) => (formDirty = dirty),
      },
      breakpoints: [0, 0.9],
      initialBreakpoint: 0.9
    });

    await modal.present();
    await modal.onWillDismiss();
  }

  // Al entrar a network después del registro/onboarding revisamos si hay un referido pendiente
  private async checkPendingReferral() {
    const raw = localStorage.getItem('cdh_pending_ref');
    if (!raw) return;

    localStorage.removeItem('cdh_pending_ref');

    let pending: { empresaId: number; productoId: number };
    try {
      pending = JSON.parse(raw);
    } catch {
      return;
    }

    let formDirty = false;

    const modal = await this.modalCtrl.create({
      component: ReferidoRegistroModalComponent,
      cssClass: 'modal-registro-referido',
      componentProps: {
        empresaID: Number(pending.empresaId) || 0,
        productoID: Number(pending.productoId) || 0,
        setFormDirtyStatus: (dirty: boolean) => (formDirty = dirty),
      },
      breakpoints: [0, 0.9],
      initialBreakpoint: 0.9
    });

    await modal.present();
    await modal.onWillDismiss();
  }

  redirigirAlRegistro(promo: any) {
    const empresaId =
      promo?.empresaID ?? promo?.EmpresaID ?? promo?.empresaId ??
      this.empresaActualId ?? 0;

    const productoId = this.getProductoId(promo);
    const tel = localStorage.getItem('cdh_tel');

    console.log('[Network] click promo', { empresaId, productoId, tel });

    // 1) Si NO está registrado → guardamos pendiente y mandamos a registro
    if (!tel) {
      localStorage.setItem(
        'cdh_pending_ref',
        JSON.stringify({
          empresaId: Number(empresaId) || 0,
          productoId: Number(productoId) || 0,
        })
      );

      this.router.navigate(['/registro'], {
        queryParams: {
          productoID: productoId || null
        }
      });

      return;
    }

    // 2) Si YA está registrado → abrimos el modal de referido directo
    this.abrirModalAgregar({
      ...promo,
      empresaID: empresaId,
    });
  }
}