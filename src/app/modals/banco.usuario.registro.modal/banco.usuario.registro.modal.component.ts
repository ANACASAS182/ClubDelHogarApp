import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { BancoUsuario } from 'src/app/models/BancoUsuario';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { BancoUsuarioService } from 'src/app/services/api.back.services/banco.usuario.service';

/* ===== Catálogo: objeto id/nombre ===== */
export interface BancoCat { id: number; nombre: string; }

@Component({
  selector: 'app-banco.usuario.registro.modal',
  templateUrl: './banco.usuario.registro.modal.component.html',
  styleUrls: ['./banco.usuario.registro.modal.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class BancoUsuarioRegistroModalComponent implements OnInit {

  formulario: FormGroup;
  btnName = 'AGREGAR';
  title  = 'AGREGAR';
  @Input() id?: number = undefined;

  bancosMx: BancoCat[] = [
    { id: 1, nombre: 'BBVA' }, { id: 2, nombre: 'Santander' }, { id: 3, nombre: 'Banorte' },
    { id: 4, nombre: 'Citibanamex' }, { id: 5, nombre: 'HSBC' }, { id: 6, nombre: 'Scotiabank' },
    { id: 7, nombre: 'Inbursa' }, { id: 8, nombre: 'Banco Azteca' }, { id: 9, nombre: 'BanCoppel' },
    { id: 10, nombre: 'Bajío (BanBajío)' }, { id: 11, nombre: 'Afirme' }, { id: 12, nombre: 'Mifel' },
    { id: 13, nombre: 'BanRegio' }, { id: 14, nombre: 'IXE' }
  ];

  get isOtro(): boolean {
    return this.formulario.get('banco')?.value === 'Otro';
  }

  formEnviado = false;

  constructor(
    private fb: FormBuilder,
    private bancoUsuarioService: BancoUsuarioService,
    private toastController: ToastController,
    private modalCtrl: ModalController
  ) {
    this.formulario = this.fb.group({
      titular: ['', Validators.required],

      // banco: id (number) del catálogo o 'Otro'
      banco: ['', Validators.required],
      bancoOtro: [''], // requerido si banco == 'Otro'

      tipoCuenta: [null, Validators.required], // 0=Tarjeta, 1=CLABE
      cuenta: [''] // validación dinámica según tipoCuenta
    });
  }

  ngOnInit() {
    // suscripciones UNA sola vez
    this.formulario.get('banco')!.valueChanges.subscribe(() => this.syncBancoOtroValidator());
    this.formulario.get('tipoCuenta')!.valueChanges.subscribe(() => this.syncCuentaValidator());

    if (this.id != undefined) {
      this.btnName = 'GUARDAR';
      this.title = 'MODIFICAR';

      this.bancoUsuarioService.getBancoByID(this.id).subscribe({
        next: (response: GenericResponseDTO<BancoUsuario>) => {
          const r = response.data;

          // tratar de mapear el nombre al catálogo; si no, usar 'Otro'
          const match = this.bancosMx.find(x => x.nombre.toLowerCase() === (r.nombreBanco || '').toLowerCase());
          const bancoValue = match ? match.id : 'Otro';
          const bancoOtro  = match ? '' : (r.nombreBanco || '');

          this.formulario.patchValue({
            titular: r.nombreTitular,
            banco: bancoValue,        // id del catálogo o 'Otro'
            bancoOtro: bancoOtro,     // solo si es 'Otro'
            cuenta: r.numeroCuenta,
            // si el back ya tiene el campo, úsalo; si no, se queda null
            tipoCuenta: (r as any).tipoCuenta ?? null
          });

          // sincroniza validadores con los valores cargados
          this.syncBancoOtroValidator();
          this.syncCuentaValidator();
        }
      });
    }
  }

  /* === Validación dinámica: 'Otro' === */
  private syncBancoOtroValidator() {
    const otro = this.formulario.get('bancoOtro')!;
    if (this.isOtro) {
      otro.addValidators([Validators.required, Validators.minLength(3)]);
    } else {
      otro.clearValidators();
      otro.setValue('');
    }
    otro.updateValueAndValidity({ emitEvent: false });
  }

  /* === Validación dinámica: tipo de cuenta === */
  private syncCuentaValidator() {
    const tipo = this.formulario.get('tipoCuenta')!.value; // 0 o 1
    const ctrl = this.formulario.get('cuenta')!;
    ctrl.clearValidators();

    if (tipo === 0) { // Tarjeta (15–19)
      ctrl.addValidators([
        Validators.required,
        Validators.pattern(/^[0-9]{15,19}$/)
      ]);
    } else if (tipo === 1) { // CLABE (18)
      ctrl.addValidators([
        Validators.required,
        Validators.pattern(/^[0-9]{18}$/)
      ]);
    }
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  onBancoChange() {
    this.syncBancoOtroValidator();
  }

  enviarFormulario() {
    if (this.formEnviado) return;
    this.formEnviado = true;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.formEnviado = false;
      return;
    }

    // banco: si es id numérico usamos catálogo, si es 'Otro' usamos bancoOtro
    const bancoValue = this.formulario.value.banco; // number | 'Otro'
    const catBancoId = bancoValue === 'Otro' ? null : Number(bancoValue) || null;
    const bancoNombreFromCat = catBancoId
      ? (this.bancosMx.find(b => b.id === catBancoId)?.nombre ?? '')
      : null;
    const bancoOtro = bancoValue === 'Otro'
      ? (this.formulario.value.bancoOtro || '').trim()
      : null;

    // payload tolerante (usa any por si tu interfaz aún no tiene los nuevos campos)
    const model: any = {
      id: this.id ?? undefined,
      nombreBanco: bancoNombreFromCat || bancoOtro || '',
      catBancoId,
      bancoOtro,
      nombreTitular: this.formulario.value.titular,
      tipoCuenta: Number(this.formulario.value.tipoCuenta), // 0 o 1
      numeroCuenta: String(this.formulario.value.cuenta || '').trim()
    };

    this.bancoUsuarioService.save(model)
      .pipe(finalize(() => (this.formEnviado = false)))
      .subscribe({
        next: (resp: GenericResponseDTO<boolean>) => {
          if (resp) {
            this.toastController.create({
              message: this.id ? 'Tarjeta actualizada.' : 'Tarjeta guardada.',
              duration: 2500,
              color: 'success',
              position: 'top'
            }).then(t => t.present());
            this.modalCtrl.dismiss(true);
          }
        }
      });
  }

  getControl(name: string) {
    return this.formulario.get(name);
  }

  close() {
    this.modalCtrl.dismiss();
  }
}