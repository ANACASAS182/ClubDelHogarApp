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

// === NUEVO: servicio fiscal
import { FiscalService, UsuarioFiscal } from 'src/app/services/api.back.services/fiscal.service';

// --------- Ver PDF
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// imports arriba
import { EmpresaFiscalService } from 'src/app/services/api.back.services/empresa-fiscal.service';

// === Regex de validación fiscal
const RFC_REGEX  = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;
const CURP_REGEX = /^[A-Z][AEIOU][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i;



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
  pdfUrl?: SafeResourceUrl;
  esPersonaFisica = false;
  empresaIdActual?: number;
  empresaMetodoPago: string = 'PPD'; // default sensato
  empresaUsoCFDI: string = 'P01';    // default sensato
  esSocio: boolean | null = null; // 👈 en vez de false
 /* mostrarPdf = false;*/

  // alert
  mostrarAlerta = false;
  botonesAlerta: any[] = [];
  fechaRegistro: Date | undefined = undefined;

  // ===== Datos fiscales =====
  constanciaFile?: File | null = null;
  constanciaLabel = 'Subir constancia (PDF)';

  // NUEVO: estado fiscal
  regimenes: Array<{ clave: string; descripcion: string }> = [];
  cargandoFiscal = false;
  guardandoFiscal = false;
  subiendoConstancia = false;
  hasConstanciaServer = false;

  get tieneConstancia() { return this.hasConstanciaServer || !!this.constanciaFile; }

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private toastController: ToastController,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private bancoUsuarioService: BancoUsuarioService,
    private alertController: AlertController,
    private fiscalService: FiscalService,
    private empFiscalSrv: EmpresaFiscalService,
    private sanitizer: DomSanitizer,
  ) {

    this.formulario = this.fb.group({
      // ===== Perfil =====
      nombre: ["", Validators.required],
      apellido: ["", Validators.required],
      celular: ["", Validators.required],
      ciudad: ["", Validators.required],
      estado: [""],
      estadoTexto: [""],
      email: ["", [Validators.required, Validators.email]],

      // ===== Datos fiscales =====
      nombreSat: [""],
      rfc: ["", [Validators.pattern(RFC_REGEX)]],
      curp: ["", [Validators.pattern(CURP_REGEX)]],
      cpFiscal: ["", [Validators.pattern(/^\d{5}$/)]],
      regimenFiscal: [""],
    });
  }

  ngOnInit() {
  const resolverData = this.route.snapshot.data['resolverData'];
  this.estados = resolverData.estados;

  this.usuarioService.getUsuario().subscribe({
    next: (response) => {
      this.loginUser = response.data;
      this.isNacional = !!(this.loginUser!.catalogoEstadoID && this.loginUser!.catalogoEstadoID > 0);
      this.fechaRegistro = this.loginUser.fechaCreacion;

      const nombreFull = [this.loginUser.nombres, this.loginUser.apellidos].filter(Boolean).join(' ').trim();
      this.formulario.patchValue({
        nombre: this.loginUser.nombres,
        apellido: this.loginUser.apellidos,
        celular: this.loginUser.celular,
        ciudad: this.loginUser.ciudad,
        estado: this.loginUser.catalogoEstadoID,
        estadoTexto: this.loginUser.estadoTexto,
        email: this.loginUser.email,
        nombreSat: nombreFull,
      });

      // === Roles correctos ===
      const rolId = (this.loginUser as any)?.rolID ?? (this.loginUser as any)?.rolesID ?? 0;
      const ES_SOCIO = Number(rolId) === 2;
      const ES_EMBAJADOR = Number(rolId) === 3;

      // Para la vista (ocultar métodos de pago si es socio)
      this.esSocio = ES_SOCIO;

      if (ES_EMBAJADOR) {
        // Embajador -> Persona física (fiscales de usuario)
        this.cargarFiscalesUsuario();
        // Embajador sí puede tener métodos de pago
        this.obtenerBancos();
      } else if (ES_SOCIO) {
        // Socio -> Persona moral (fiscales de empresa)
        this.usuarioService.getEmpresaByUsuario(this.loginUser.id!).subscribe({
          next: (empResp: GenericResponseDTO<any>) => {
            const empresa = empResp?.data;
            const empresaId = empresa?.id ?? empresa?.ID;
            if (!empresaId) { this.cargarFiscalesUsuario(); return; } // fallback
            this.empresaIdActual = empresaId;
            this.cargarFiscalesEmpresa(empresaId);
          },
          error: _ => this.cargarFiscalesUsuario()
        });
        // ❌ No cargar bancos si es socio (se oculta el card)
      } else {
        // Otros roles: trata como empresa si existe, si no, usuario
        this.usuarioService.getEmpresaByUsuario(this.loginUser.id!).subscribe({
          next: (empResp: GenericResponseDTO<any>) => {
            const empresa = empResp?.data;
            const empresaId = empresa?.id ?? empresa?.ID;
            if (!empresaId) { this.cargarFiscalesUsuario(); return; }
            this.empresaIdActual = empresaId;
            this.cargarFiscalesEmpresa(empresaId);
          },
          error: _ => this.cargarFiscalesUsuario()
        });
        this.obtenerBancos();
      }
    },
    error: _ => { this.esSocio = false; } // fallback para la vista
  });

  // Catálogo de regímenes (si usas distinto para PM, cámbialo a 'M')
  this.cargandoFiscal = true;
  this.fiscalService.getRegimenes('F').subscribe({
    next: r => this.regimenes = r.data || [],
    error: _ => this.toast('No se pudo cargar el catálogo de regímenes', 'danger'),
    complete: () => this.cargandoFiscal = false
  });
}



  // helper que ya usabas pero envuelto
  private cargarFiscalesUsuario() {
    // 🔑 Marca que es persona física
    this.esPersonaFisica = true;

    this.fiscalService.getMisDatos().subscribe({
      next: r => {
        const d = r.data;
        if (d) {
          this.formulario.patchValue({
            nombreSat: d.nombreSAT || '',
            rfc: d.rfc || '',
            curp: d.curp || '',
            cpFiscal: d.codigoPostal || '',
            regimenFiscal: d.regimenClave || ''
          });

          // Solo aplica constancia para usuario
          if (d.constanciaPath) {
            this.hasConstanciaServer = true;
            const nombre = d.constanciaPath.split(/[\\/]/).pop() ?? '';
            this.constanciaLabel = nombre || 'Constancia.pdf';
          }
        }
      },
      error: _ => this.toast('No se pudo cargar tus datos fiscales', 'danger')
    });
  }

  private cargarFiscalesEmpresaSiAplica() {
    this.usuarioService.getEmpresaByUsuario(this.loginUser!.id!).subscribe({
      next: (empResp) => {
        const empresa = empResp?.data;
        const empresaId = empresa?.id ?? empresa?.ID;
        if (!empresaId) { this.cargarFiscalesUsuario(); return; }
        this.empresaIdActual = empresaId;
        this.cargarFiscalesEmpresa(empresaId);
      },
      error: _ => this.cargarFiscalesUsuario()
    });
  }
  private cargarFiscalesEmpresa(empresaId: number) {
    // 🔑 Marca que es empresa (persona moral)
    this.esPersonaFisica = false;

    this.empFiscalSrv.get(empresaId).subscribe({
      next: r => {
        const d = r?.data;
        if (d) {
          this.formulario.patchValue({
            nombreSat: d.razonSocialSAT || '',
            rfc: d.rfc || '',
            cpFiscal: d.codigoPostal || '',
            // en empresa el régimen suele ser fijo (601),
            // pero si lo traes del backend lo pones:
            regimenFiscal: d.regimenClave || '601'
          });
          // ⚠️ Ojo: no parcheamos curp ni constancia porque no aplica
        }
      },
      error: _ => this.toast('No se pudo cargar los datos fiscales de la empresa', 'danger')
    });
  }



  /* ================= Bancos ================= */

  obtenerBancos() {
    this.bancos = [];
    this.bancoUsuarioService.getBancosUsuario().subscribe({
      next: (response: GenericResponseDTO<BancoUsuario[]>) => {
        this.bancos = response.data;
      }
    });
  }

  async editarTarjeta(idEdit?: number) {
    const modal = await this.modalCtrl.create({
      component: BancoUsuarioRegistroModalComponent,
      cssClass: 'modal-redondeado',
      componentProps: { id: idEdit }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) this.obtenerBancos();
  }

  async agregarNuevaTarjeta() {
    const modal = await this.modalCtrl.create({
      component: BancoUsuarioRegistroModalComponent,
      cssClass: 'modal-redondeado',
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) this.obtenerBancos();
  }

  async mostrarAlertaConfirmacion(id?: number) {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: 'Esta acción eliminará el elemento permanentemente.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, eliminar',
          handler: () => this.deleteCuentaBancaria(id)
        }
      ]
    });
    await alert.present();
  }

  deleteCuentaBancaria(id?: number) {
    if (!id) return;
    this.bancoUsuarioService.delete(id).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        if (response) {
          this.toast("Cambios guardados.", 'success');
          this.obtenerBancos();
        }
      }
    });
  }

  /* ================= Perfil ================= */

  guardarCambiosUsuario() {
    if (this.formUsuarioEnviado) return;
    this.formUsuarioEnviado = true;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.formUsuarioEnviado = false;
      return;
    }

    const dto: UsuarioDTO = {
      apellidos: this.formulario.controls["apellido"].value,
      nombres: this.formulario.controls["nombre"].value,
      email: this.formulario.controls["email"].value,
      celular: this.formulario.controls["celular"].value,
      ciudad: this.formulario.controls["ciudad"].value,
      estadoTexto: this.formulario.controls["estadoTexto"].value,
      catalogoEstadoID: this.formulario.controls["estado"].value,
    };

    this.usuarioService.updateUsuario(dto).pipe(
      finalize(() => { this.formUsuarioEnviado = false; })
    ).subscribe({
      next: (_res: GenericResponseDTO<boolean>) => {
        this.toast("Cambios guardados.", 'success');
      }
    });
  }

  /* ================= Datos Fiscales ================= */

  onConstanciaSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.toast('Solo se admite PDF.', 'danger');
      input.value = '';
      return;
    }

    this.constanciaFile = file;
    this.constanciaLabel = `${file.name} (${Math.round(file.size / 1024)} KB)`;
  }

  clearConstancia() {
  // Solo limpia la selección local; no borra la del servidor.
  this.constanciaFile = null;
  this.constanciaLabel = 'Subir constancia (PDF)';
  const el = document.getElementById('constanciaInput') as HTMLInputElement | null;
  if (el) el.value = '';
  // hasConstanciaServer SE QUEDA como estaba
}

  guardarDatosFiscales(): void {
    if (this.guardandoFiscal) return;

    if (this.esPersonaFisica) {
      // === PERSONA FÍSICA (usuario)
      const dto: UsuarioFiscal = {
        nombreSAT: (this.formulario.value.nombreSat || '').trim(),
        rfc: (this.formulario.value.rfc || '').toUpperCase().trim(),
        // manda NULL si viene vacío, para no violar el CHECK
        curp: ((this.formulario.value.curp || '').trim().toUpperCase()) || null,
        codigoPostal: (this.formulario.value.cpFiscal || '').trim(),
        regimenClave: (this.formulario.value.regimenFiscal || '').trim()
      };

      // validaciones suaves
      if (dto.rfc && !RFC_REGEX.test(dto.rfc)) { this.toast('RFC inválido', 'danger'); return; }
      if (dto.curp && !CURP_REGEX.test(dto.curp)) { this.toast('CURP inválida', 'danger'); return; }
      if (dto.codigoPostal && !/^\d{5}$/.test(dto.codigoPostal)) { this.toast('CP inválido', 'danger'); return; }
      if (!dto.regimenClave) { this.toast('Selecciona un régimen', 'danger'); return; }

      this.guardandoFiscal = true;
      this.fiscalService.guardar(dto)
        .pipe(finalize(() => this.guardandoFiscal = false))
        .subscribe({
          next: _ => {
            this.toast('Datos fiscales guardados', 'success');
            if (this.constanciaFile) {
              this.subiendoConstancia = true;
              this.fiscalService.subirConstancia(this.constanciaFile)
                .pipe(finalize(() => this.subiendoConstancia = false))
                .subscribe({
                  next: _r => this.toast('Constancia subida', 'success'),
                  error: _e => this.toast('No se pudo subir el PDF', 'danger')
                });
            }
          },
          error: _ => this.toast('Error al guardar datos fiscales', 'danger')
        });

    } else {
      // === PERSONA MORAL (empresa)
      const empresaId = this.empresaIdActual ?? null;
                        
      if (!empresaId) { this.toast('No se encontró EmpresaID', 'danger'); return; }

      const dtoEmp = {
        empresaID: empresaId,
        rfc: (this.formulario.value.rfc || '').toUpperCase().trim(),
        razonSocialSAT: (this.formulario.value.nombreSat || '').trim(),
        codigoPostal: (this.formulario.value.cpFiscal || '').trim(),
        metodoPago: this.empresaMetodoPago, // ✅
        usoCFDI: this.empresaUsoCFDI,       // ✅
        regimenClave: '601'
      };


      // validaciones básicas PM
      if (!RFC_REGEX.test(dtoEmp.rfc)) {
        this.toast('RFC inválido', 'danger');
        return;
      }
      if (!/^\d{5}$/.test(dtoEmp.codigoPostal)) { this.toast('CP inválido', 'danger'); return; }

      this.guardandoFiscal = true;
      this.empFiscalSrv.guardar(dtoEmp)
        .pipe(finalize(() => this.guardandoFiscal = false))
        .subscribe({
          next: _ => this.toast('Datos fiscales de empresa guardados', 'success'),
          error: _ => this.toast('Error al guardar datos fiscales de empresa', 'danger')
        });
    }
  }


  /*verConstancia() {
    this.fiscalService.getConstanciaBlob().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.mostrarPdf = true;
      },
      error: _ => this.toast('No se pudo abrir la constancia', 'danger')
    });
  }*/

    private blobToBase64(b: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve((r.result as string).split(',')[1]); // quita "data:...;base64,"
    r.onerror = reject;
    r.readAsDataURL(b);
  });
}

  descargarConstancia() {
  this.fiscalService.descargarConstanciaBlob().subscribe({
    next: async (blob) => {
      const baseName = (this.constanciaLabel || 'constancia.pdf').replace(/\s+/g, '_');
      const fileName = baseName.toLowerCase().endsWith('.pdf') ? baseName : `${baseName}.pdf`;

      const isNativeIOS = Capacitor.isNativePlatform() && /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isNativeIOS) {
        // 1) Guardar en Archivos -> En mi iPhone -> <NombreApp> -> Documents
        const base64 = await this.blobToBase64(blob);
        await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Documents,   // carpeta Documents de la app
        });

        // 2) Obtener URI del archivo y abrir Share Sheet (guardar/enviar)
        const { uri } = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Documents,
        });

        await Share.share({
          title: 'Constancia fiscal',
          url: uri,                         // iOS acepta file:// o capacitor:// (Filesystem te da el correcto)
          dialogTitle: 'Compartir constancia',
        });

        return;
      }

      // Web / Android: descarga clásica
      const a = document.createElement('a');
      const objUrl = URL.createObjectURL(blob);
      a.href = objUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
    },
    error: (e) => this.toast(`No se pudo descargar la constancia (HTTP ${e?.status ?? '—'})`, 'danger')
  });
}



  /* ================= Utils ================= */

  getControl(name: string) {
    return this.formulario.get(name);
  }

  enmascararCuenta(cuenta: string) {
    if (!cuenta) return '';
    const visible = cuenta.slice(-4);
    const oculto = cuenta.slice(0, -4).replace(/\d/g, '*');
    return oculto + visible;
  }

  formatFecha(fecha?: Date): string {
    if (fecha == undefined) return "No aplica";
    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    let mes = f.toLocaleString('es-MX', { month: 'long' });
    mes = mes.charAt(0).toUpperCase() + mes.slice(1);
    const anio = f.getFullYear();
    let horas = f.getHours();
    const minutos = f.getMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    horas = horas ? horas : 12;
    const horaFormateada = horas.toString().padStart(2, '0');
    return `${dia} de ${mes} del ${anio} - ${horaFormateada}:${minutos} ${ampm}`;
  }

  // toast helper
  private async toast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'primary') {
    const t = await this.toastController.create({
      message, duration: 3000, color, position: 'top', cssClass: 'toast-embassy'
    });
    await t.present();
  }

  private ensureAbsolute(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    const base = (environment.apiUrl || '').replace(/\/$/, '');
    const path = (url || '').replace(/^\//, '');
    return `${base}/${path}`;
  }

}