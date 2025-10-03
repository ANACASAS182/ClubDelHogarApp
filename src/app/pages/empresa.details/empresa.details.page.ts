import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ReferidoRegistroModalComponent } from 'src/app/modals/referido.registro.modal/referido.registro.modal.component';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Producto } from 'src/app/models/Producto';
import { Promocion } from 'src/app/models/Promocion';
import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { PromocionesService } from 'src/app/services/api.back.services/promociones.service';
import { ModalAlerReferidoService } from 'src/app/services/modal.alert.referido.service';
import { environment } from 'src/environments/environment';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';

@Component({
  selector: 'app-empresa.details',
  templateUrl: './empresa.details.page.html',
  styleUrls: ['./empresa.details.page.scss'],
  standalone:false,
})
export class EmpresaDetailsPage implements OnInit, AfterViewInit {

  logoEmpresa: string = '';
  private readonly fallbackLogo = 'assets/imgs/logo-placeholder.png';
  razonSocial: string = '';
  descripcionEmpresa: string = '';
  nombreComercial: string = '';
  empresaID: number = 0;
  esSocio = false;

  dataSourceTable = new MatTableDataSource<Producto>();
  displayedColumns: string[] = ['Nombre', 'ComisionCantidad', 'ComisionPorcentaje', 'ComisionPorcentajeCantidad', 'FechaCaducidad'];
  total: any;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private route: ActivatedRoute,
    private promocionesService: PromocionesService,
    private modalCtrl: ModalController,
    private modalAlert: ModalAlerReferidoService,
    private empresaService: EmpresaService,
    private usuarioService: UsuarioService
  ) {}

  ngAfterViewInit() {
    this.dataSourceTable.paginator = this.paginator;
    this.loadtable();
  }

  private normalizeLogo(input?: string): string {
    if (!input) return '';
    const s = input.trim();
    if (s.startsWith('data:image')) return s;
    if (/^https?:\/\//i.test(s)) return s;
    const base = (environment.apiUrl || '').replace(/\/+$/, '');
    return `${base}/${s.replace(/^\/+/, '')}`;
  }

  onLogoError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img && img.src !== this.fallbackLogo) {
      img.src = this.fallbackLogo;
    }
  }

  private asTipoStrict(val: any): 0 | 1 | null {
    const s = String(val ?? '').trim();
    if (s === '0') return 0;
    if (s === '1') return 1;
    return null;
  }

  public formatCantidadPlano(valor: number | undefined, moneda: string | undefined): string {
    const v = Number(valor ?? 0);
    const s = v.toFixed(2).replace(/\.00$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
    return `${s} ${moneda || 'MXN'}`;
  }

  private normalizePromocion(raw: any): Promocion {
    const tipoStrict = this.asTipoStrict(raw?.tipoComision ?? raw?.TipoComision);
    let monto = Number(
      raw?.comisionCantidad ?? raw?.ComisionCantidad ??
      raw?.comisionMonto    ?? raw?.ComisionMonto    ??
      raw?.Precio ?? 0
    );
    let pct = Number(
      raw?.comisionPorcentaje ?? raw?.ComisionPorcentaje ??
      raw?.ComisionPorcentajeCantidad ?? raw?.porcentaje ??
      raw?.Porcentaje ?? 0
    );
    const moneda = raw?.moneda || raw?.Moneda || raw?.monedaCodigo || raw?.Currency || raw?.currency || 'MXN';

    let tipoFinal: 0 | 1 | null = tipoStrict;
    if (tipoFinal === 0) pct = 0;
    else if (tipoFinal === 1) monto = 0;
    else { monto = 0; pct = 0; }

    const comisionTexto =
      tipoFinal === 0 ? this.formatCantidadPlano(monto, moneda) :
      tipoFinal === 1 ? `${pct.toString().replace(/\.0+$/, '')}%` :
      'No configurada';

    return {
      ...raw,
      tipoComision: tipoFinal,
      moneda,
      comisionCantidad: monto,
      comisionPorcentaje: pct,
      comision: comisionTexto,
      ComisionCantidad: monto,
      ComisionPorcentajeCantidad: pct
    } as Promocion;
  }

  promociones: Promocion[] = [];
  cargandoPromociones = true;

  loadtable() {
    this.cargandoPromociones = true;
    setTimeout(() => {
      this.promocionesService.GetPromocionesEmpresa(this.empresaID).subscribe({
        next: (data) => {
          this.promociones = (data ?? []).map(p => this.normalizePromocion(p));
          this.cargandoPromociones = false;
        },
        error: _ => this.cargandoPromociones = false
      });
    }, 200);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const empresaID = Number(params['empresaID']);
      this.empresaID = empresaID;

      this.empresaService.getEmpresaByID(empresaID).subscribe({
        next: (response) => {
          const emp = response.data;
          this.razonSocial = emp.razonSocial;
          this.descripcionEmpresa = emp.descripcion;
          this.nombreComercial = emp.nombreComercial;
          this.logoEmpresa = this.normalizeLogo(emp.logotipoBase64 ?? emp.logotipoPath);
        }
      });

      this.usuarioService.getUsuario().subscribe({
        next: (resp: GenericResponseDTO<any>) => {
          const u = resp.data;
          // ⚠️ clave: en JSON viene como rolesID
          const rolId = Number(
            u?.rolesID ?? u?.RolesID ??
            u?.rolID   ?? u?.rolId   ??
            u?.rol?.id ?? u?.rol     ?? 0
          );
          this.esSocio = (rolId === 2);
          console.log('[EmpresaDetails] rolId=', rolId, 'esSocio=', this.esSocio);
        }
      });
    });
  }

  async abrirModal() {
    let formDirty = false;
    const modal = await this.modalCtrl.create({
      component: ReferidoRegistroModalComponent,
      cssClass: 'modal-redondeado',
      componentProps: {
        empresaID: this.empresaID,
        setFormDirtyStatus: (dirty: boolean) => formDirty = dirty
      },
      canDismiss: async () => {
        if (!formDirty) return true;
        const shouldClose = await this.modalAlert.confirmarCierreModal();
        return shouldClose;
      }
    });
    await modal.present();
  }

  formatFecha(fecha?: Date): string {
    if (fecha == undefined) return 'No aplica';
    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    let mes = f.toLocaleString('es-MX', { month: 'long' });
    mes = mes.charAt(0).toUpperCase() + mes.slice(1);
    const anio = f.getFullYear();
    return `${dia} ${mes} ${anio}`;
  }
}
