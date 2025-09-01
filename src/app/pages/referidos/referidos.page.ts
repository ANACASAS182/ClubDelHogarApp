import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { EstatusReferenciaEnum } from 'src/app/enums/estatus.referencia.enum';
import { ReferidoRegistroModalComponent } from 'src/app/modals/referido.registro.modal/referido.registro.modal.component';
import { ReferidoSeguimientoModalComponent } from 'src/app/modals/referido.seguimiento.modal/referido.seguimiento.modal.component';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { ReferidoDTO } from 'src/app/models/DTOs/ReferidoDTO';
import { Usuario } from 'src/app/models/Usuario';
import { ReferidoService } from 'src/app/services/api.back.services/referido.service';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { ModalAlerReferidoService } from 'src/app/services/modal.alert.referido.service';

@Component({
  selector: 'app-referidos',
  templateUrl: './referidos.page.html',
  styleUrls: ['./referidos.page.scss'],
  standalone: false,
})
export class ReferidosPage implements OnInit, AfterViewInit {

  IngresoPotencialView: string = "";
  IngresoGeneradoView: string = "";

  // table (si la usas en otra vista)
  dataSourceTable = new MatTableDataSource<ReferidoDTO>();
  displayedColumns: string[] = ['Nombre', 'Celular', 'Empresa', 'Producto', 'Comision', 'Estatus', 'Visualizar'];
  total: any;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // input busqueda
  inputBuscar = new Subject<string>();
  query: string = "";

  constructor(
    private referidoService: ReferidoService,
    private usuarioService: UsuarioService,
    private modalCtrl: ModalController,
    private modalAlert: ModalAlerReferidoService
  ) { }

  ngAfterViewInit() { }

  referidos: ReferidoUI[] = [];
  cargandoReferidos: boolean = false;

  ngOnInit() {
    this.cargarReferidos();
  }

  private esReciente(fecha?: Date): boolean {
    if (!fecha) return false;
    const diff = Date.now() - new Date(fecha).getTime();
    return diff <= 48 * 60 * 60 * 1000; // 48h
  }

  cargarReferidos() {
    this.cargandoReferidos = true;
    this.referidos = [];

    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        const userId = response.data.id;

        this.referidoService.getReferidosSimple(userId).subscribe({
          next: (data) => {
            // 1) normaliza teléfonos
            this.referidos = data.map(r => {
              const p = parseMxPhone(r.celular);
              return <ReferidoUI>{
                ...r,
                celularView: p.view,
                celularE164: p.e164,
                celularInvalido: p.invalid
              };
            });

            // 2) totales
            let ingresoGenerado = 0;
            let ingresoPotencial = 0;
            this.referidos.forEach(r => {
              const c = +(r.comision ?? 0);
              ingresoPotencial += c;
              if (r.estatusReferenciaID === 3) ingresoGenerado += c;
            });
            this.IngresoGeneradoView  = '$' + ingresoGenerado.toFixed(2);
            this.IngresoPotencialView = '$' + ingresoPotencial.toFixed(2);

            // 3) cargar últimos seguimientos en lote (evita N+1)
            const ids = this.referidos.map(r => r.id!).filter(Boolean);
            if (!ids.length) { this.cargandoReferidos = false; return; }

            // Implementa en tu servicio un endpoint:
            // getUltimosSeguimientos(ids:number[]) => Observable<UltimoSeg[]>
            this.referidoService.getUltimosSeguimientos(ids).subscribe({
              next: (lista: UltimoSeg[]) => {
                const mapSeg = new Map<number, UltimoSeg>();
                lista.forEach(x => mapSeg.set(x.referidoId, x));

                this.referidos = this.referidos.map(r => {
                  const seg = r.id ? mapSeg.get(r.id) : undefined;
                  const fecha = seg?.fecha ? new Date(seg.fecha) : undefined;
                  return {
                    ...r,
                    ultimoSeguimientoTexto: seg?.texto,
                    ultimoSeguimientoFecha: fecha,
                    _segEsReciente: this.esReciente(fecha)
                  };
                });

                this.cargandoReferidos = false;
              },
              error: () => { this.cargandoReferidos = false; }
            });
          },
          error: () => { this.cargandoReferidos = false; }
        });
      },
      error: () => { this.cargandoReferidos = false; }
    });
  }

  async abrirModal() {
    let formDirty = false;

    const modal = await this.modalCtrl.create({
      component: ReferidoRegistroModalComponent,
      cssClass: 'modal-redondeado',
      componentProps: {
        setFormDirtyStatus: (dirty: boolean) => formDirty = dirty
      },
      canDismiss: async () => {
        if (!formDirty) return true;
        const shouldClose = await this.modalAlert.confirmarCierreModal();
        return shouldClose;
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) this.cargarReferidos();
  }

  async abrirModalVisualizacion(model: ReferidoDTO) {
    const modal = await this.modalCtrl.create({
      component: ReferidoSeguimientoModalComponent,
      cssClass: 'modal-redondeado',
      componentProps: { referido: model }
    });

    await modal.present();
    await modal.onDidDismiss(); // si regresa algo podrías refrescar
  }

  getColorEstatus(estatus: EstatusReferenciaEnum): string {
    switch (estatus) {
      case EstatusReferenciaEnum.Creado: return 'estatus-creado';
      case EstatusReferenciaEnum.Seguimiento: return 'estatus-seguimiento';
      case EstatusReferenciaEnum.Cerrado: return 'estatus-cerrado';
      default: return 'estatus-other';
    }
  }

  formatFecha(fecha?: Date): string {
    if (fecha == undefined) return "No aplica";
    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    let mes = f.toLocaleString('es-MX', { month: 'short' });
    mes = mes.charAt(0).toUpperCase() + mes.slice(1);
    const anio = f.getFullYear();
    let horas = f.getHours();
    const minutos = f.getMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12; horas = horas ? horas : 12;
    const horaFormateada = horas.toString().padStart(2, '0');
    return `${dia} ${mes} ${anio} - ${horaFormateada}:${minutos} ${ampm}`;
  }
}

/* ===== Tipos auxiliares ===== */
type UltimoSeg = { referidoId: number; texto: string; fecha: string | Date };

type PhoneInfo = {
  view: string;
  e164: string | null;
  invalid: boolean;
};

type ReferidoUI = ReferidoDTO & {
  celularView: string;
  celularE164: string | null;
  celularInvalido: boolean;

  // preview de seguimiento
  ultimoSeguimientoTexto?: string;
  ultimoSeguimientoFecha?: Date;
  _segEsReciente?: boolean;
};

/* ===== Utilidad de normalización de teléfono MX ===== */
function parseMxPhone(raw?: string | null): PhoneInfo {
  const clean = (raw ?? '').replace(/[^\d]/g, '');
  if (!clean) return { view: 'No proporcionado', e164: null, invalid: false };

  let d = clean;
  if (d.startsWith('521') && d.length === 13) d = '52' + d.slice(3);
  if (d.startsWith('52') && d.length === 12) d = d.slice(2);
  if (d.length !== 10) return { view: 'Número inválido', e164: null, invalid: true };

  const allSame = /^(\d)\1{9}$/.test(d);
  const sequential = d === '1234567890' || d === '0987654321';
  const black = d === '0000000000' || d === '1111111111';
  const invalid = allSame || sequential || black;

  const e164 = `+52${d}`;
  const view = `(+52) ${d.slice(0,2)} ${d.slice(2,6)} ${d.slice(6)}`;
  return { view, e164, invalid };
}