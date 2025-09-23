import { DatePipe } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Usuario } from 'src/app/models/Usuario';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { TokenService } from 'src/app/services/token.service';
import { ModalController } from '@ionic/angular';
import { ModalQRComponent } from 'src/app/modals/modal-qr/modal-qr.component';
import { OnboardingComponent } from 'src/app/modals/onboarding/onboarding.component';
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { Preferences } from '@capacitor/preferences';

type PageItem = {
  title: string;
  tituloMovil: string;
  url: string;
  icon: string;
  visible: boolean;
  access: number[]; // roles permitidos
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  userName = '';
  currentDate = '';
  empresaName: string | null = null;

  isMobile = false;
  esSocio = false;
  UsuarioID = 0;
  isAdmin = false;
  esEmbajador = false;

  // 1 = Admin, 2 = Socio, 3 = Embajador (ajústalo a tu enum real)
  public appPages: PageItem[] = [
    { title: 'Network',   tituloMovil: 'Network',   url: '/dashboard/network',       icon: 'network',       visible: false, access: [1,2,3] },
    { title: 'Referidos', tituloMovil: 'Referidos', url: '/dashboard/referidos',     icon: 'referidos',     visible: false, access: [1,3] },
    { title: 'Mi Célula', tituloMovil: 'Célula',    url: '/dashboard/celula',        icon: 'network',       visible: false, access: [3]     },
    { title: 'Referencias', tituloMovil: 'Referencias',url: '/dashboard/referencias', icon: 'referidos', visible: false,   access: [2] },
    /*{ title: 'Referencias', tituloMovil: 'Referencias', url: '/dashboard/referencias-app', icon: 'referidos', visible: false, access: [2] },*/
    { title: 'Mis Datos', tituloMovil: 'Mis Datos', url: '/dashboard/configuracion', icon: 'configuracion', visible: false, access: [1,2,3] }
  ];

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private modalCtrl: ModalController,
    private datePipe: DatePipe,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.checkScreenSize();

    const now = new Date();
    this.currentDate =
      (this.datePipe.transform(now, 'fullDate') ?? '') + ' - ' +
      (this.datePipe.transform(now, 'hh:mm a') ?? '');

    // Carga del usuario
    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        const u: any = response.data;

        this.userName = `${u?.nombres ?? ''} ${u?.apellidos ?? ''}`.trim();
        this.UsuarioID = u?.id ?? u?.ID ?? 0;

        const roleVal = (u?.rolesId ?? u?.rolesID ?? 0);
        this.isAdmin     = roleVal === 1;
        this.esSocio     = roleVal === 2;
        this.esEmbajador = roleVal === 3;

        // visibilidad por rol
        this.appPages.forEach(p => p.visible = p.access.includes(roleVal));

        // empresa rápida
        this.empresaName = this.getEmpresaNombreFallback(u);

        // empresa fina solo si no es embajador (o si quieres solo para socio, deja el if como estaba)
        if (!this.esEmbajador && this.UsuarioID) {
          this.usuarioService.getEmpresaByUsuario(this.UsuarioID, true).subscribe({
            next: (resp: any) => {
              const e = resp?.data;
              const nombre = this.pickEmpresaNombre(e);
              if (nombre) this.empresaName = nombre;
            }
          });
        }

        if (u?.mostrarOnboarding) this.mostrarOnboarding();
      }
    });
  }

  /** Lee nombre empresa desde varias fuentes sin levantar toasts */
  private getEmpresaNombreFallback(u: any): string {
    const first =
      u?.empresaNombre ??
      u?.empresaRazonSocial ??
      u?.empresa?.nombre ??
      u?.empresa?.razonSocial;
    if (first && String(first).trim()) return String(first).trim();

    try {
      const c1 = (this.tokenService as any)?.getClaim?.('EmpresaNombre');
      const c2 = (this.tokenService as any)?.getClaim?.('empresaNombre');
      if (c1 && String(c1).trim()) return String(c1).trim();
      if (c2 && String(c2).trim()) return String(c2).trim();
    } catch { /* noop */ }

    const ls = localStorage.getItem('empresaNombre');
    if (ls && ls.trim()) return ls.trim();

    return '(Sin empresa)';
    }

  /** Normaliza el nombre devuelto por el endpoint */
  private pickEmpresaNombre(e: any): string | null {
    return (
      e?.razonSocial ??
      e?.RazonSocial ??
      e?.nombreComercial ??
      e?.NombreComercial ??
      e?.rfc ??
      null
    );
  }

  @HostListener('window:resize', [])
  onResize() { /* si quieres, recalcula isMobile */ }

  checkScreenSize() { /* opcional: this.isMobile = window.innerWidth <= 768; */ }

  async logout() {
    await this.tokenService.removeToken();
    localStorage.removeItem('usuario-actual');
    await Preferences.remove({ key: 'correoAlmacenado' });
    await Preferences.remove({ key: 'passwordAlmacenado' });
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  async abrirModalQr() {
    const result = await CapacitorBarcodeScanner.scanBarcode({ hint: 1, scanButton: true });
    const modal = await this.modalCtrl.create({
      component: ModalQRComponent,
      cssClass: 'modal-redondeado',
      componentProps: { codigoParametro: result.ScanResult },
      canDismiss: async () => true
    });
    await modal.present();
    await modal.onDidDismiss();
  }

  async mostrarOnboarding() {
    let formDirty = false;
    const modal = await this.modalCtrl.create({
      component: OnboardingComponent,
      cssClass: 'modal-redondeado',
      componentProps: {
        usuarioId: this.UsuarioID,
        setFormDirtyStatus: (dirty: boolean) => (formDirty = dirty)
      },
      canDismiss: async () => !formDirty || true
    });
    await modal.present();
  }

  get rolActual(): string {
    if (this.isAdmin) return 'Administrador';
    if (this.esEmbajador) return 'Embajador';
    if (this.esSocio) return 'Socio';
    return '—';
  }
}