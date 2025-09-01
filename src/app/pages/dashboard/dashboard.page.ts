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
import { OnboardingComponent } from 'src/app/modals/onboarding/onboarding.component';

import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';

import { Preferences } from '@capacitor/preferences';

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
    //{ title: 'Mis Productos', tituloMovil: 'Productos', url: '/dashboard/productos', icon: 'configuracion' },
    //,
    { title: 'Configuración', tituloMovil: 'Configuracion', url: '/dashboard/configuracion', icon: 'configuracion' }
  ];
  constructor(private router: Router, private tokenService: TokenService,
    private modalCtrl: ModalController,
    private datePipe: DatePipe, private usuarioService: UsuarioService) { }


  UsuarioID: number = 0;

    
  esSocio:boolean=false;

  async ngOnInit() {

    this.checkScreenSize();

    const now = new Date();
    this.currentDate = this.datePipe.transform(now, 'fullDate') + ' - ' + this.datePipe.transform(now, 'hh:mm a');

    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        console.log(response.data);
        this.userName = response.data.nombres + " " + response.data.apellidos;
        this.UsuarioID = response.data.id;



        Preferences.set({
          key:'nombreAlmacenado', value :response.data.nombres
        });

        if(response.data.rolesID == 2){
        this.esSocio =true;
//        this.appPages.push({ title: 'Activaciones', tituloMovil: 'Activaciones', url: '/dashboard/activaciones', icon: 'configuracion' });
        }

        if(response.data.mostrarOnboarding){
          this.appPages = [];
          this.mostrarOnboarding();
        }

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
  localStorage.removeItem('usuario-actual');
  await Preferences.remove({ key: 'correoAlmacenado' });    // si quieres forzar limpio
  await Preferences.remove({ key: 'passwordAlmacenado' });
  // 👇 Si hay endpoint en backend
  // await this.http.post('/api/Usuario/Logout', {}).toPromise().catch(()=>{});
  // y que el backend expire la cookie si hay
  this.router.navigate(['/login'], { replaceUrl: true });
}

  async abrirModalQr() {
    console.log("hola");

let result = await CapacitorBarcodeScanner.scanBarcode({
  hint:1,
  scanButton:true
});

console.log(result);
console.log("adios");

    let formDirty = false;

    const modal = await this.modalCtrl.create({
      component: ModalQRComponent,
      cssClass: 'modal-redondeado',
      componentProps: {
        codigoParametro: result.ScanResult
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

  async mostrarOnboarding(){
    let formDirty = false;
        const modal = await this.modalCtrl.create({
          component: OnboardingComponent,
          cssClass: 'modal-redondeado',
          componentProps: {
            usuarioId: this.UsuarioID,
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
