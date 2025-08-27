import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalController } from '@ionic/angular';
import { catchError, debounceTime, distinctUntilChanged, map, merge, of, startWith, Subject, switchMap } from 'rxjs';
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

  //table
  dataSourceTable = new MatTableDataSource<ReferidoDTO>();
  displayedColumns: string[] = ['Nombre', 'Celular', 'Empresa', 'Producto', 'Comision', 'Estatus', 'Visualizar'];
  total: any;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  //input busqueda
  inputBuscar = new Subject<string>();
  query: string = "";

  constructor(private referidoService: ReferidoService,
    private usuarioService: UsuarioService,
    private modalCtrl: ModalController,
    private modalAlert: ModalAlerReferidoService
  ) { }

  ngAfterViewInit() {

  }

  referidos: ReferidoUI[] = [];
  cargandoReferidos: boolean = false;
  ngOnInit() {


    this.cargarReferidos();

  }

  cargarReferidos() {
    this.cargandoReferidos = true;
    this.referidos = [];

    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        const userId = response.data.id;

        // (El setTimeout no es necesario; si lo quieres, déjalo. Aquí lo quito para ir directo.)
        this.referidoService.getReferidosSimple(userId).subscribe({
          next: (data) => {
            // 👉 mapeo con la normalización/validación del teléfono
            this.referidos = data.map(r => {
              const p = parseMxPhone(r.celular);
              return {
                ...r,
                celularView: p.view,
                celularE164: p.e164,
                celularInvalido: p.invalid
              };
            });

            let ingresoGenerado = 0;
            let ingresoPotencial = 0;

            this.referidos.forEach(r => {
              const c = +(r.comision ?? 0);
              ingresoPotencial += c;
              if (r.estatusReferenciaID === 3) ingresoGenerado += c;
            });

            this.IngresoGeneradoView  = '$' + ingresoGenerado.toFixed(2);
            this.IngresoPotencialView = '$' + ingresoPotencial.toFixed(2);
            this.cargandoReferidos = false;
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

    //respuesta de modal (El modal ya se encarga de guardar/mostrar mensajes, no es necesario tratar los datos.)
    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log(data);
      this.cargarReferidos();
    }
  }

  async abrirModalVisualizacion(model: ReferidoDTO) {

    const modal = await this.modalCtrl.create({
      component: ReferidoSeguimientoModalComponent,
      cssClass: 'modal-redondeado',
      componentProps: {
        referido: model
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log(data);

    }
  }

  getColorEstatus(estatus: EstatusReferenciaEnum): string {
    switch (estatus) {
      case EstatusReferenciaEnum.Creado:
        return 'estatus-creado';
      case EstatusReferenciaEnum.Seguimiento:
        return 'estatus-seguimiento';
      case EstatusReferenciaEnum.Cerrado:
        return 'estatus-cerrado';
      default:
        return 'estatus-other';
    }
  }
  formatFecha(fecha?: Date): string {

    if (fecha == undefined) {
      return "No aplica";
    }

    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    let mes = f.toLocaleString('es-MX', { month: 'short' });
    mes = mes.charAt(0).toUpperCase() + mes.slice(1);
    const anio = f.getFullYear();
    let horas = f.getHours();
    const minutos = f.getMinutes().toString().padStart(2, '0');

    // Si quieres formato 12 horas con AM/PM:
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    horas = horas ? horas : 12; // el 0 se convierte en 12
    const horaFormateada = horas.toString().padStart(2, '0');

    return `${dia} ${mes} ${anio} - ${horaFormateada}:${minutos} ${ampm}`;
  }
}

type PhoneInfo = {
  view: string;           // (+52) 55 1234 5678  (o “No proporcionado” / “Número inválido”)
  e164: string | null;    // +52XXXXXXXXXX si es válido
  invalid: boolean;       // true si es obvio falso (1111111111 / 1234567890 / etc.)
};

function parseMxPhone(raw?: string | null): PhoneInfo {
  const clean = (raw ?? '').replace(/[^\d]/g, '');
  if (!clean) return { view: 'No proporcionado', e164: null, invalid: false };

  // Normalizaciones comunes en MX
  let d = clean;

  // WhatsApp antiguo: 521 + 10 dígitos → quitar el "1"
  if (d.startsWith('521') && d.length === 13) d = '52' + d.slice(3);

  // Si viene como 52 + 10 dígitos, quítale 52 para formatear nacional
  if (d.startsWith('52') && d.length === 12) d = d.slice(2);

  // Al final debemos tener 10 dígitos nacionales
  if (d.length !== 10) return { view: 'Número inválido', e164: null, invalid: true };

  // Sospechosos: repetidos o secuencias
  const allSame = /^(\d)\1{9}$/.test(d);
  const sequential = d === '1234567890' || d === '0987654321';
  const black = d === '0000000000' || d === '1111111111';
  const invalid = allSame || sequential || black;

  const e164 = `+52${d}`;
  const view = `(+52) ${d.slice(0,2)} ${d.slice(2,6)} ${d.slice(6)}`;
  return { view, e164, invalid };
}

type ReferidoUI = ReferidoDTO & {
  celularView: string;
  celularE164: string | null;
  celularInvalido: boolean;
};


