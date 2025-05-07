import { Component, OnInit } from '@angular/core';
import { UsuarioCelula } from 'src/app/models/DTOs/CelulaDTO';
import { UsuarioService } from '../../services/api.back.services/usuario.service';
import { InvitarComponent } from 'src/app/modals/invitar/invitar.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-celula',
  templateUrl: './celula.page.html',
  styleUrls: ['./celula.page.scss'],
  standalone: false
})
export class CelulaPage implements OnInit {

  constructor(private _usuarioService:UsuarioService, private modalCtrl: ModalController) { }

  celula?: UsuarioCelula;

  ngOnInit(): void {
    this._usuarioService.getCelulaLocal(1).subscribe({
      next: (data) =>{
        console.log("celula");
        console.log(data);
        this.celula = data;
      },
      error: (err) =>{},
      complete:() => {}
    });

  }

  
  async onFabClick() {
    let formDirty = false;
        const modal = await this.modalCtrl.create({
          component: InvitarComponent,
          cssClass: 'modal-redondeado',
          componentProps: {
            empresaID: 1,
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


