import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonicModule, LoadingController, ModalController, NavParams, ToastController } from '@ionic/angular';
import { IonInput, IonButton, IonHeader, IonItem, IonToolbar } from "@ionic/angular/standalone";
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Empresa } from 'src/app/models/Empresa';
import { Producto } from 'src/app/models/Producto';
import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { ProductoService } from 'src/app/services/api.back.services/producto.service';
import { ReferidoService } from 'src/app/services/api.back.services/referido.service';
import { ReferidoDTO } from 'src/app/models/DTOs/ReferidoDTO';
import { finalize, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-referido.registro.modal',
  templateUrl: './referido.registro.modal.component.html',
  styleUrls: ['./referido.registro.modal.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class ReferidoRegistroModalComponent implements OnInit {

  formulario: FormGroup;
  empresas: Empresa[] = [];
  productos: Producto[] = [];

  formEnviado: boolean = false;
  hideProducto: boolean = true;

  @Input() empresaID: number = 0;
  @Input() setFormDirtyStatus: ((dirty: boolean) => void) | undefined;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private empresaService: EmpresaService,
    private productoService: ProductoService,
    private referidoService: ReferidoService,
    private toastController: ToastController,
    private loadingCtrl: LoadingController
    ) {
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      celular: ['', Validators.required],
      empresa: ['', Validators.required],
      producto: ['', Validators.required],
    });
  }

  async ngOnInit() {


    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos...'
    });
    await loading.present();

    try {
      // Cargar empresas
      const responseEmpresa = await firstValueFrom(this.empresaService.getAllEmpresas());
      this.empresas = responseEmpresa?.data || [];

      // Cargar productos
      if (this.empresaID > 0) {
        this.formulario.patchValue({ empresa: Number(this.empresaID) });
        const responseProducto = await firstValueFrom(this.productoService.getAllProductosEmpresa(this.empresaID));
        this.productos = responseProducto?.data || [];
        this.hideProducto = false;
      }

    } catch (error) {
      console.error('Error al cargar datos', error);
      this.empresas = [];
      this.productos = [];
    } finally {
      loading.dismiss();
    }

    this.formulario.valueChanges.subscribe(() => {
      const isDirty = this.formulario.dirty;
      if (this.setFormDirtyStatus) {
        this.setFormDirtyStatus(isDirty);
      }
    });

  }
  onEmpresaChange(event: any) {
    this.productos = [];
    const idSelected = event.detail.value;
    this.productoService.getAllProductosEmpresa(idSelected).pipe(
      finalize(() => {
        this.hideProducto = false;
      })
    ).subscribe({
      next: (response: GenericResponseDTO<Producto[]>) => {
        this.productos = response.data;
      }
    })

  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  enviarFormulario() {
    if (this.formEnviado) return;

    this.formEnviado = true;

    if (this.formulario.valid) {

      var model: ReferidoDTO = {
        celular: this.formulario.controls["celular"].value,
        email: this.formulario.controls["correo"].value,
        nombreCompleto: this.formulario.controls["nombre"].value,
        productoID: this.formulario.controls["producto"].value,
        empresaID: this.formulario.controls["empresa"].value
      }

      model.comisionTexto = "";
      this.referidoService.guardarReferido(model).pipe(
        finalize(() => {
          this.formEnviado = false;
        })
      ).subscribe({
        next: (response) => {
          if (this.setFormDirtyStatus) {
            this.setFormDirtyStatus(false);
          }
          this.modalCtrl.dismiss(true);
          this.toastController.create({
            message: "Referido guardado",
            duration: 3000,
            color: "success",
            position: 'top'
          }).then(toast => toast.present());
        }
      });

      // this.modalCtrl.dismiss(this.formulario.value);
    } else {
      this.formulario.markAllAsTouched();
      this.formEnviado = false;
    }
  }

  getControl(name: string) {
    return this.formulario.get(name);
  }

  close() {
    this.modalCtrl.dismiss();
  }
  isDirty(): boolean {
    return this.formulario.dirty;
  }
}
