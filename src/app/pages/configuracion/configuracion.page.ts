import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { BancoUsuarioRegistroModalComponent } from 'src/app/modals/banco.usuario.registro.modal/banco.usuario.registro.modal.component';
import { BancoUsuario } from 'src/app/models/BancoUsuario';
import { CatalogoEstado } from 'src/app/models/CatalogoEstado';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { UsuarioDTO } from 'src/app/models/DTOs/UsuarioDTO';
import { Usuario } from 'src/app/models/Usuario';
import { BancoUsuarioService } from 'src/app/services/api.back.services/banco.usuario.service';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
  standalone: false,
})
export class ConfiguracionPage implements OnInit {

  formulario: FormGroup;
  loginUser?: Usuario;
  isNacional: boolean = false;
  estados: CatalogoEstado[] = [];
  bancos: BancoUsuario[] = [];
  formUsuarioEnviado: boolean = false;
  //alert
  mostrarAlerta = false;
  botonesAlerta = [];
  fechaRegistro: Date | undefined = undefined;

  constructor(private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private toastController: ToastController,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private bancoUsuarioService: BancoUsuarioService,
    private alertController: AlertController) {
    this.formulario = this.fb.group({
      nombre: ["", Validators.required],
      apellido: ["", Validators.required],
      celular: ["", Validators.required],
      ciudad: ["", Validators.required],
      estado: [""],
      estadoTexto: [""],
      email: ["", [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    const resolverData = this.route.snapshot.data['resolverData'];
    this.estados = resolverData.estados;
    this.obtenerBancos();
    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        this.loginUser = response.data;

        if (this.loginUser!.catalogoEstadoID != undefined && this.loginUser.catalogoEstadoID > 0) {
          this.isNacional = true;
        } else {
          this.isNacional = false;
        }

        this.fechaRegistro = this.loginUser.fechaCreacion;
        this.formulario.patchValue({
          nombre: this.loginUser.nombres,
          apellido: this.loginUser.apellidos,
          celular: this.loginUser.celular,
          ciudad: this.loginUser.ciudad,
          estado: this.loginUser.catalogoEstadoID,
          estadoTexto: this.loginUser.estadoTexto,
          email: this.loginUser.email
        });
      }
    });
  }

  obtenerBancos() {
    this.bancos = [];
    this.bancoUsuarioService.getBancosUsuario().subscribe({
      next: (response: GenericResponseDTO<BancoUsuario[]>) => {
        this.bancos = response.data;
      }
    });
  }

  guardarCambiosUsuario() {
    if (this.formUsuarioEnviado) return;

    this.formUsuarioEnviado = true

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.formUsuarioEnviado = false;
      return;
    }

    var dto: UsuarioDTO = {
      apellidos: this.formulario.controls["apellido"].value,
      nombres: this.formulario.controls["nombre"].value,
      email: this.formulario.controls["email"].value,
      celular: this.formulario.controls["celular"].value,
      ciudad: this.formulario.controls["ciudad"].value,
      estadoTexto: this.formulario.controls["estadoTexto"].value,
      catalogoEstadoID: this.formulario.controls["estado"].value,
    }

    this.usuarioService.updateUsuario(dto).pipe(
      finalize(() => {
        this.formUsuarioEnviado = false;
      })
    ).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        this.toastController.create({
          message: "Cambios guardados.",
          duration: 3000,
          color: "success",
          position: 'top'
        }).then(toast => toast.present());
      }
    });
  }


  getControl(name: string) {
    return this.formulario.get(name);
  }

  enmascararCuenta(cuenta: string) {
    if (!cuenta) return '';
    const visible = cuenta.slice(-4);
    const oculto = cuenta.slice(0, -4).replace(/\d/g, '*');
    return oculto + visible;
  }

  async mostrarAlertaConfirmacion(id?: number) {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: 'Esta acción eliminará el elemento permanentemente.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancelado');
          }
        },
        {
          text: 'Sí, eliminar',
          handler: () => {
            console.log('Elemento eliminado');
            this.deleteCuentaBancaria(id);
          }
        }
      ]
    });

    await alert.present();
  }

  async editarTarjeta(idEdit?: number) {
    const modal = await this.modalCtrl.create({
      component: BancoUsuarioRegistroModalComponent,
      cssClass: 'modal-redondeado',
      componentProps: {
        id: idEdit
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log(data);
      this.obtenerBancos();
    }
  }

  async agregarNuevaTarjeta() {
    const modal = await this.modalCtrl.create({
      component: BancoUsuarioRegistroModalComponent,
      cssClass: 'modal-redondeado',
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log(data);
      this.obtenerBancos();
    }
  }

  deleteCuentaBancaria(id?: number) {
    this.bancoUsuarioService.delete(id!).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        if (response) {
          this.toastController.create({
            message: "Tarjeta eliminada.",
            duration: 3000,
            color: "success",
            position: 'top'
          }).then(toast => toast.present());
          this.obtenerBancos();
        }
      }
    }
    );
  }

  formatFecha(fecha?: Date): string {

    if (fecha == undefined) {
      return "No aplica";
    }

    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    let mes = f.toLocaleString('es-MX', { month: 'long' });
    mes = mes.charAt(0).toUpperCase() + mes.slice(1);
    const anio = f.getFullYear();
    let horas = f.getHours();
    const minutos = f.getMinutes().toString().padStart(2, '0');

    // Si quieres formato 12 horas con AM/PM:
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    horas = horas ? horas : 12; // el 0 se convierte en 12
    const horaFormateada = horas.toString().padStart(2, '0');

    return `${dia} de ${mes} del ${anio} - ${horaFormateada}:${minutos} ${ampm}`;
  }

}
