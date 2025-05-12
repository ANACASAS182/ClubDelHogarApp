import { Component, OnInit } from '@angular/core';
import { UsuarioCelula } from 'src/app/models/DTOs/CelulaDTO';
import { UsuarioService } from '../../services/api.back.services/usuario.service';
import { InvitarComponent } from 'src/app/modals/invitar/invitar.component';
import { ModalController } from '@ionic/angular';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Usuario } from 'src/app/models/Usuario';

@Component({
  selector: 'app-celula',
  templateUrl: './celula.page.html',
  styleUrls: ['./celula.page.scss'],
  standalone: false
})
export class CelulaPage implements OnInit {

  constructor(private _usuarioService: UsuarioService, private modalCtrl: ModalController) { }

  celula?: UsuarioCelula;

  UsuarioID: number = 0;

  cargandoCelula: boolean = true;

  ngOnInit(): void {

    this.cargandoCelula = true;

    this._usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        console.log(response.data);
        this.UsuarioID = response.data.id;

        // Usamos setTimeout para introducir un retraso de 1 segundo (1000 ms)
        setTimeout(() => {
          this._usuarioService.getCelulaLocal(1).subscribe({
            next: (data) => {
              console.log("celula");
              console.log(data);
              this.celula = data;
              this.cargandoCelula = false;
            },
            error: (err) => { },
            complete: () => { }
          });
        }, 2000);  // Retraso de 1 segundo
      }
    });


  }


  async onFabClick() {
    let formDirty = false;
    const modal = await this.modalCtrl.create({
      component: InvitarComponent,
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


