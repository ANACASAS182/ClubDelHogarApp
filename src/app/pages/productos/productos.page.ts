import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/api.back.services/usuario.service';
import { PromocionesService } from '../../services/api.back.services/promociones.service';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Usuario } from 'src/app/models/Usuario';
import { Promocion } from 'src/app/models/Promocion';
import { ModalController } from '@ionic/angular';
import { AgregarPromocionComponent } from 'src/app/modals/agregar-promocion/agregar-promocion.component';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: false
})
export class ProductosPage implements OnInit {

  UsuarioID: number = 0;
  promociones: Promocion[] = [];
  cargandoPromociones: boolean = true;

  constructor(
    private usuarioService: UsuarioService,
    private promocionesService: PromocionesService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        console.log(response.data);
        this.UsuarioID = response.data.id;

        // Usamos setTimeout para introducir un retraso de 1 segundo (1000 ms)
        setTimeout(() => {
          this.promocionesService.GetPromocionesSocio(this.UsuarioID).subscribe({
            next: (data) => {
              this.promociones = data;
              this.cargandoPromociones = false;
            }
          });
        }, 2000);  // Retraso de 1 segundo
      }
    });
  }

  abrirModalPromocion(promocion:Promocion){

  }

   async abrirModalAgregarPromocion() {
      let formDirty = false;
      const modal = await this.modalCtrl.create({
        component: AgregarPromocionComponent,
        cssClass: 'modal-redondeado',
        componentProps: {
          EmbajadorReferenteID: this.UsuarioID,
          setFormDirtyStatus: (dirty: boolean) => formDirty = dirty
        },
        canDismiss: async () => {
          if (!formDirty) return true;
  
          const shouldClose = true;
          return shouldClose;
        }
      });
      await modal.present();
    }

}
