import { Component, Input, input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Empresa } from 'src/app/models/Empresa';
import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { IonHeader, IonItem, IonCard, IonToolbar, IonButton, IonButtons, IonContent, IonGrid, IonRow } from "@ionic/angular/standalone";
import { Promocion } from 'src/app/models/Promocion';
import { PromocionComponent } from 'src/app/modals/promocion/promocion.component';
import { ModalController } from '@ionic/angular';
import { PromocionesService } from 'src/app/services/api.back.services/promociones.service';
import { UsuarioService } from '../../services/api.back.services/usuario.service';
import { Usuario } from 'src/app/models/Usuario';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';

@Component({
  selector: 'app-empresas.network',
  templateUrl: './empresas.network.page.html',
  styleUrls: ['./empresas.network.page.scss'],
  standalone:false,
})
export class EmpresasNetworkPage implements OnInit {

  UsuarioID:number = 0;

  empresas : Empresa[]= [];

  promociones:Promocion[] = [];
   cargandoPromociones:boolean = true;

  constructor(private router : Router, private activeRoute: ActivatedRoute, 
    private empresaService : EmpresaService,
    private promocionesService : PromocionesService,
    private usuarioService:UsuarioService,
    private modalCtrl: ModalController
  ) { } 
  
  ngOnInit() {  
    const resolverData = this.activeRoute.snapshot.data['resolverData'];
    this.empresas = resolverData.empresas;
  
    this.cargandoPromociones = true;
    
    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        console.log(response.data);
        this.UsuarioID = response.data.id;
  
        // Usamos setTimeout para introducir un retraso de 1 segundo (1000 ms)
        setTimeout(() => {
          this.promocionesService.GetPromociones(this.UsuarioID).subscribe({
            next: (data) => {
              this.promociones = data;
              this.cargandoPromociones = false;
            }
          });
        }, 2000);  // Retraso de 1 segundo
      }
    });
  }
  


  verMas(item: any) {
    console.log('Ver más:', item);
    this.router.navigate(['/dashboard/empresa/detalle'], { queryParams: { empresaID: item.id } });
  }

  async abrirModalPromocion(promoSeleccionada:Promocion) {
        let formDirty = false;
  
        const modal = await this.modalCtrl.create({
          component: PromocionComponent,
          cssClass: 'modal-redondeado',
          componentProps: {
            promoSeleccionada:promoSeleccionada,
            UsuarioID:this.UsuarioID,
            setFormDirtyStatus: (dirty: boolean) => formDirty = dirty
          },
          canDismiss: async () => {
            if (!formDirty) return true;
    
            const shouldClose = true;
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

}
