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

  referidos: ReferidoDTO[] = [];
  cargandoReferidos:boolean = false;
  ngOnInit() {

    this.cargandoReferidos = true;
    
    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        console.log(response.data);
        response.data.id;
  
        // Usamos setTimeout para introducir un retraso de 1 segundo (1000 ms)
        setTimeout(() => {
          this.referidoService.getReferidosSimple(response.data.id).subscribe({
            next: (data) => {
              this.referidos = data;
              this.cargandoReferidos = false;
            }
          });
        }, 2000);  // Retraso de 1 segundo
      }
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

  }
}
  
    async abrirModalVisualizacion(model : ReferidoDTO) {

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
formatFecha(fecha ?: Date): string {

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
