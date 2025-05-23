import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { IonInput, IonButton, IonHeader, IonItem, IonToolbar, IonIcon, IonContent } from "@ionic/angular/standalone";
import { LoaderComponent } from "../../loader/loader.component";
import { MensajeTemporalComponent } from "../../mensaje-temporal/mensaje-temporal.component";
import { UtilitiesService } from '../../utilities.service';
import { CrearPromocionRequest, PromocionesService } from '../../services/api.back.services/promociones.service';
import { UsuarioService } from '../../services/api.back.services/usuario.service';

@Component({
  selector: 'app-agregar-promocion',
  templateUrl: './agregar-promocion.component.html',
  styleUrls: ['./agregar-promocion.component.scss'],
  imports: [IonicModule, CommonModule, LoaderComponent, FormsModule, MensajeTemporalComponent],
})
export class AgregarPromocionComponent implements OnInit {

  CapturandoInformacionGeneral: boolean = false;
  CapturandoVigencia: boolean = false;
  CapturandoTablaComisiones: boolean = false;
  ConfirmandoDatosIngresados: boolean = false;
  CambiandoSeccion: boolean = false;
  estatusNuevaPromocion:number = 0;

  NombrePromocion: string = "";
  DescripcionPromocion: string = "";

  comisionNivel1: number = 0;
  comisionNivel2: number = 0;
  comisionNivel3: number = 0;
  comisionNivel4: number = 0;
  comisionNivelMaster: number = 0;
  //comisionTotal:number = 0;

  VigenciaPromocionISO: string = "";
  VigenciaPromocionTexto: string = "";

  constructor(
    private modalCtrl: ModalController,
    private promocionesService: PromocionesService,
    private usuarioService: UsuarioService,
    private utilities: UtilitiesService
  ) {

  }


  ngOnInit() {
    this.HabilitarCapturaDatosGenerales();
  }

  get comisionTotal(): number {
    const n1 = this.comisionNivel1 * 1;
    const n2 = this.comisionNivel2 * 1;
    const n3 = this.comisionNivel3 * 1;
    const n4 = this.comisionNivel4 * 1;
    const master = this.comisionNivelMaster * 1;

    return n1 + n2 + n3 + n4 + master;
  }

  HabilitarCapturaDatosGenerales() {
    this.CapturandoTablaComisiones = false;
    this.ConfirmandoDatosIngresados = false;
    this.CapturandoVigencia = false;

    this.CambiandoSeccion = true;

    setTimeout(() => {
      this.CapturandoInformacionGeneral = true;
      this.CambiandoSeccion = false;
    }, 1000);
  }


  MensajeValidacionDatosGenerales: string = "";
  ValidacionesDatosGenerales(): boolean {
    this.MensajeValidacionDatosGenerales = '';

    if (this.NombrePromocion == '') {
      this.MensajeValidacionDatosGenerales = "Debes capturar el nombre del producto o promoción";
      return false;
    }

    if (this.NombrePromocion.length < 6 || this.NombrePromocion.length > 32) {
      this.MensajeValidacionDatosGenerales = "El nombre del producto o promoción debe tener entre 6 y 32 caracteres";
      if (this.NombrePromocion.length > 32) {
        this.NombrePromocion = this.NombrePromocion.substring(0, 31).trim();
      }
      return false;
    }

    if (this.DescripcionPromocion == '') {
      this.MensajeValidacionDatosGenerales = "Debes capturar la descripción del producto o promoción";
      return false;
    }



    if (this.DescripcionPromocion.length < 32 || this.DescripcionPromocion.length > 256) {
      this.MensajeValidacionDatosGenerales = "La descripción del producto o promoción debe tener entre 32 y 256 caracteres";
      if (this.DescripcionPromocion.length > 256) {
        this.DescripcionPromocion = this.DescripcionPromocion.substring(0, 255).trim();
      }
      return false;
    }

    return true;
  }

  MensajeValidacionVigencia: string = "";
  ValidacionesVigencia(): boolean {
    this.MensajeValidacionVigencia = '';

    if (this.VigenciaPromocionISO == '') {
      this.MensajeValidacionVigencia = "Debes seleccionar la vigencia que tendrá tu promoción";
      return false;
    } else {
      this.VigenciaPromocionTexto = this.utilities.formatoFechaEspanol(this.VigenciaPromocionISO);
    }



    return true;
  }

  HabilitarCapturaVigencia() {

    if (!this.ValidacionesDatosGenerales()) {
      return;
    }


    this.CapturandoInformacionGeneral = false;
    this.CapturandoTablaComisiones = false;
    this.ConfirmandoDatosIngresados = false;

    this.CambiandoSeccion = true;

    setTimeout(() => {
      this.CapturandoVigencia = true;
      this.CambiandoSeccion = false;
    }, 1000);

  }

  HabilitarCapturaTablaComisiones() {



    if (!this.ValidacionesVigencia()) {
      return;
    }

    this.CapturandoVigencia = false;
    this.ConfirmandoDatosIngresados = false;
    this.CapturandoInformacionGeneral = false;

    this.CambiandoSeccion = true;
    setTimeout(() => {
      this.CapturandoTablaComisiones = true;
      this.CambiandoSeccion = false;
    }, 1000);

  }

  MensajeValidacionComisiones: string = "";
  ValidacionesTablaComisiones(): boolean {
    this.MensajeValidacionComisiones = "";

    if (this.comisionNivel1 <= 1) {
      this.MensajeValidacionComisiones = "Debes ingresar un valor para cada una de las comisiones";
      return false;
    }

    if (this.comisionNivel2 <= 1) {
      this.MensajeValidacionComisiones = "Debes ingresar un valor para cada una de las comisiones";
      return false;
    }

    if (this.comisionNivel3 <= 1) {
      this.MensajeValidacionComisiones = "Debes ingresar un valor para cada una de las comisiones";
      return false;
    }

    if (this.comisionNivel4 <= 1) {
      this.MensajeValidacionComisiones = "Debes ingresar un valor para cada una de las comisiones";
      return false;
    }

    if (this.comisionNivelMaster <= 1) {
      this.MensajeValidacionComisiones = "Debes ingresar un valor para cada una de las comisiones";
      return false;
    }


    if (this.comisionTotal <= 1) {
      this.MensajeValidacionComisiones = "Debes ingresar un valor para cada una de las comisiones";
      return false;
    }


    return true;
  }

  HabilitarConfirmarDatos() {

    if (!this.ValidacionesTablaComisiones()) {
      return;
    }

    this.CapturandoTablaComisiones = false;
    this.CambiandoSeccion = true;
    setTimeout(() => {
      this.CapturandoInformacionGeneral = false;
      this.ConfirmandoDatosIngresados = true;
      this.CambiandoSeccion = false;
    }, 1000);
  }

  promocionCreada: number = 0;
  agregarPromocion() {

    this.estatusNuevaPromocion = 1;

    this.usuarioService.getUsuario().subscribe({
      next: (u) => {
        let r: CrearPromocionRequest = {
          usuarioID: u.data.id,
          nombre: this.NombrePromocion,
          descripcion: this.DescripcionPromocion,
          VigenciaISO: this.VigenciaPromocionISO,
          comisionNivel1: this.comisionNivel1,
          comisionNivel2: this.comisionNivel2,
          comisionNivel3: this.comisionNivel3,
          comisionNivel4: this.comisionNivel4,
          comisionNivelMaster: this.comisionNivelMaster
        }



        this.promocionesService.CrearNuevaPromocion(r).subscribe({
          next: (p) => {

            this.promocionCreada = p.estatus;

            if(this.promocionCreada){
              this.estatusNuevaPromocion = 2;
            } else {
              this.estatusNuevaPromocion = -1;

            }

          }
        });
      }
    });


  }

  close() {
    this.modalCtrl.dismiss();
  }
}
