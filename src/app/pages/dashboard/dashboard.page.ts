import { DatePipe } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Usuario } from 'src/app/models/Usuario';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { TokenService } from 'src/app/services/token.service';
import { UsuarioRegistroPageModule } from '../usuario.registro/usuario.registro.module';
import { ModalController } from '@ionic/angular';
import { ModalQRComponent } from 'src/app/modals/modal-qr/modal-qr.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  userName: string = '';
  currentDate: string = "";

  usuarioEmpresa: boolean = false;
  isMobile = false;

  userRol: string = "Embajador"; //ROLES AUN NO ESTAN DEFINIDOS


  public appPages = [
    { title: 'Network', tituloMovil: 'Network', url: '/dashboard/network', icon: 'network' },
    { title: 'Referidos', tituloMovil: 'Referidos', url: '/dashboard/referidos', icon: 'referidos' },
    { title: 'Mi Célula', tituloMovil: 'Célula', url: '/dashboard/celula', icon: 'network' },
    { title: 'Mis Productos', tituloMovil: 'Productos', url: '/dashboard/productos', icon: 'configuracion' },
    { title: 'Activaciones', tituloMovil: 'Activaciones', url: '/dashboard/activaciones', icon: 'configuracion' },
    { title: 'Configuración', tituloMovil: 'Configuracion', url: '/dashboard/configuracion', icon: 'configuracion' }

  ];
  constructor(private router: Router, private tokenService: TokenService,
    private modalCtrl: ModalController,
    private datePipe: DatePipe, private usuarioService: UsuarioService) { }


  UsuarioID: number = 0;

  ngOnInit() {

    this.checkScreenSize();

    const now = new Date();
    this.currentDate = this.datePipe.transform(now, 'fullDate') + ' - ' + this.datePipe.transform(now, 'hh:mm a');

    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        console.log(response.data);
        this.userName = response.data.nombres + " " + response.data.apellidos;
        this.UsuarioID = response.data.id;
      }
    });
  }


  @HostListener('window:resize', [])
  onResize() {
    //this.checkScreenSize();
  }

  checkScreenSize() {
    //this.isMobile = window.innerWidth <= 768; // Puedes ajustar el breakpoint
  }

  async logout() {
    await this.tokenService.removeToken();
    this.router.navigate(['/login']);
  }

  async abrirModalQr() {
    let formDirty = false;

    const modal = await this.modalCtrl.create({
      component: ModalQRComponent,
      cssClass: 'modal-redondeado',
      componentProps: {
        setFormDirtyStatus: (dirty: boolean) => formDirty = dirty
      },
      canDismiss: async () => {
        return true;
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
