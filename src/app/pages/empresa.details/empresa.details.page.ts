import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { ReferidoRegistroModalComponent } from 'src/app/modals/referido.registro.modal/referido.registro.modal.component';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Empresa } from 'src/app/models/Empresa';
import { Producto } from 'src/app/models/Producto';
import { Promocion } from 'src/app/models/Promocion';
import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { ProductoService } from 'src/app/services/api.back.services/producto.service';
import { PromocionesService } from 'src/app/services/api.back.services/promociones.service';
import { ModalAlerReferidoService } from 'src/app/services/modal.alert.referido.service';

@Component({
  selector: 'app-empresa.details',
  templateUrl: './empresa.details.page.html',
  styleUrls: ['./empresa.details.page.scss'],
  standalone:false,
})
export class EmpresaDetailsPage implements OnInit, AfterViewInit {

  logoEmpresa :string = "";
  razonSocial: string = "";
  descripcionEmpresa : string = "";
  nombreComercial: string = "";
  empresaID : number = 0;

  //table productos
  dataSourceTable = new MatTableDataSource<Producto>();
  displayedColumns: string[] = ['Nombre', 'ComisionCantidad', 'ComisionPorcentaje', 'ComisionPorcentajeCantidad', 'FechaCaducidad'];
  total: any;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(private route: ActivatedRoute,
     private promocionesService: PromocionesService, 
     private modalCtrl: ModalController,
     private modalAlert: ModalAlerReferidoService,
     private empresaService : EmpresaService) {
  }

  ngAfterViewInit() {
    this.dataSourceTable.paginator = this.paginator;
    this.loadtable();
  }

   promociones:Promocion[] = [];
     cargandoPromociones:boolean = true;

  loadtable() {
    this.cargandoPromociones = true;
        
     // Usamos setTimeout para introducir un retraso de 1 segundo (1000 ms)
     setTimeout(() => {
      this.promocionesService.GetPromocionesEmpresa(this.empresaID).subscribe({
        next: (data) => {
          this.promociones = data;
          this.cargandoPromociones = false;
        }
      });
    }, 2000);  // Retraso de 1 segundo
  }


  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const empresaID = Number(params['empresaID']);
      this.empresaID = empresaID;
      this.empresaService.getEmpresaByID(empresaID).subscribe({
        next: (response : GenericResponseDTO<Empresa>) =>{
          this.razonSocial = response.data.razonSocial;
          this.logoEmpresa = response.data.logotipoPath;
          this.descripcionEmpresa = response.data.descripcion;
          this.nombreComercial = response.data.nombreComercial;
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

    if(fecha == undefined){
      return "No aplica";
    }

    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    let mes = f.toLocaleString('es-MX', { month: 'long' });
    mes = mes.charAt(0).toUpperCase() + mes.slice(1); 
    const anio = f.getFullYear();
    return `${dia} ${mes} ${anio}`;
  }
}
