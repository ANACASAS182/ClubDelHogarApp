import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { Usuario } from 'src/app/models/Usuario';
import { Promocion } from 'src/app/models/Promocion';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';

import { PromocionesService } from 'src/app/services/api.back.services/promociones.service';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { CategoriasService, Categoria } from 'src/app/services/api.back.services.cdh/categorias.service';

import { PrefsStorage } from 'src/app/core/utils/prefs.storage';
import { TokenService } from 'src/app/services/token.service';
import { PromocionComponent } from 'src/app/modals/promocion/promocion.component';
import { ModalQRComponent } from 'src/app/modals/modal-qr/modal-qr.component';

@Component({
  selector: 'app-vende-network',
  templateUrl: './vende-network.page.html',
  styleUrls: ['./vende-network.page.scss'],
  standalone: false,
})
export class VendeNetworkPage implements OnInit {

  UsuarioID = 0;
  esSocio = false;

  promociones: any[] = [];
  cargandoPromociones = true;

  categorias: Categoria[] = [];
  categoriaSeleccionada: any = null;

  nombreUsuario = '';
  correoUsuario = '';
  esInvitado = true;

  constructor(
    private router: Router,
    private promocionesService: PromocionesService,
    private usuarioService: UsuarioService,
    private categoriasService: CategoriasService,
    private modalCtrl: ModalController,
    private tokenService: TokenService,
    private prefs: PrefsStorage
  ) {}

  async ngOnInit() {
    this.cargandoPromociones = true;

    const nombrePref = await this.prefs.get('nombreAlmacenado');
    if (nombrePref) {
      this.nombreUsuario = nombrePref;
      this.esInvitado = false;
    }

    // Categorías
    this.categoriasService.getCategorias().subscribe({
      next: (resp) => {
        this.categorias = resp.data || [];
      },
      error: () => {
        this.categorias = [];
      }
    });

    // Promos
    this.promocionesService.GetPromosNetwork().subscribe({
      next: (resp) => {
        this.promociones = (resp.data || []).map((x: any) => ({
          productoID: x.ProductoID,
          nombre: x.ProductoNombre,
          descripcion: x.ProductoDescripcion,
          productoImgBase64: x.ProductoImagenBase64,

          empresaID: x.EmpresaID,
          empresaNombre: x.EmpresaNombre,
          empresaLogotipoBase64: x.EmpresaLogotipoBase64,

          categoriaID: x.CategoriaID,
          categoriaNombre: x.CategoriaNombre
        }));
        this.cargandoPromociones = false;
      },
      error: () => {
        this.promociones = [];
        this.cargandoPromociones = false;
      }
    });

    // Usuario
    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        const user = response.data;
        if (!user) {
          this.marcarInvitado();
          return;
        }

        this.UsuarioID = (user as any).id ?? (user as any).ID ?? 0;

        this.nombreUsuario = `${user.nombres ?? ''} ${user.apellidos ?? ''}`.trim();
        this.correoUsuario = (user.email ?? '').trim();

        // 👉 mismo cálculo de rol que en EmpresasNetwork
        const rolId = Number(
          (user as any)?.rolesID ?? (user as any)?.RolesID ??
          (user as any)?.rolID   ?? (user as any)?.rolId   ??
          (user as any)?.rol?.id ?? (user as any)?.rol     ?? 0
        );

        this.esSocio = (rolId === 2);     // 👈 solo socio ve el footer
        this.esInvitado = !this.UsuarioID;
      },
      error: () => {
        this.marcarInvitado();
      }
    });
  }

  private marcarInvitado() {
    this.UsuarioID = 0;
    this.nombreUsuario = '';
    this.correoUsuario = '';
    this.esInvitado = true;
  }

  get inicialesUsuario(): string {
    const n = (this.nombreUsuario || this.correoUsuario || '').trim();
    if (!n) return 'U';

    const parts = n.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }

  irConfiguracion() {
    this.router.navigate(['/configuracion/general']);
  }

  irALogin() {
    this.router.navigate(['/login']);
  }

  async cerrarSesion() {
    await this.tokenService.removeToken();

    await this.prefs.remove('correoAlmacenado');
    await this.prefs.remove('passwordAlmacenado');
    await this.prefs.remove('nombreAlmacenado');

    localStorage.removeItem('usuario-actual');
    localStorage.removeItem('cdh_tel');

    this.marcarInvitado();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  ensureDataUrl(b64?: string): string {
    if (!b64) return '';
    const clean = (b64 || '').trim().replace(/\s+/g, '');
    if (clean.startsWith('data:')) return clean;
    return `data:image/png;base64,${clean}`;
  }

  async abrirModalPromocion(promo: any) {
    if (!this.UsuarioID) {
      this.router.navigate(['/registro']);
      return;
    }

    let formDirty = false;

    const promocionAdaptada: Promocion = {
      ...(promo as any),
      iD:
        promo.iD ??
        promo.ID ??
        promo.productoID ??
        promo.ProductoID ??
        0,
      nombre:
        promo.nombre ??
        promo.nombrePromocion ??
        promo.titulo ??
        '',
      descripcion:
        promo.descripcion ??
        promo.detalle ??
        '',
      empresaNombre:
        promo.empresaNombre ??
        promo.empresa?.nombreComercial ??
        promo.empresa?.nombre ??
        '',
    };

    const modal = await this.modalCtrl.create({
      component: PromocionComponent,
      cssClass: 'modal-redondeado',
      componentProps: {
        promoSeleccionada: promocionAdaptada,
        UsuarioID: this.UsuarioID,
        setFormDirtyStatus: (dirty: boolean) => (formDirty = dirty),
      },
      breakpoints: [0, 0.9],
      initialBreakpoint: 0.9,
    });

    await modal.present();
    await modal.onDidDismiss();
  }

  get promocionesFiltradas(): any[] {
    if (!this.categoriaSeleccionada) {
      return this.promociones || [];
    }

    return (this.promociones || []).filter((p: any) => {
      const cat =
        p.categoriaID ??
        p.categoriaId ??
        p.categoria_id ??
        p.categoria ??
        null;

      return cat === this.categoriaSeleccionada;
    });
  }

  getEmpresaNombre(promo: any): string {
    return promo.empresaNombre
      || promo.empresa?.nombreComercial
      || promo.empresa?.nombre
      || 'Nombre de la empresa';
  }

  getEmpresaLogo(promo: any): string {
    const b64 =
      promo.empresaLogotipoBase64 ||
      promo.empresa?.logotipoBase64 ||
      promo.empresaLogoBase64;

    const path =
      promo.empresaLogotipoPath ||
      promo.empresa?.logotipoPath ||
      promo.empresaLogoPath;

    return this.ensureDataUrl(b64) || path || 'assets/img/no-logo.svg';
  }

  getProductoImg(promo: any): string {
    const b64 =
      promo.productoImgBase64 ||
      promo.productoImagenBase64 ||
      promo.producto?.imagenBase64;

    const path =
      promo.productoImgPath ||
      promo.productoImagenPath ||
      promo.producto?.imagenPath;

    return this.ensureDataUrl(b64) || path || '';
  }

  tieneProductoImg(promo: any): boolean {
    const b64 =
      promo.productoImgBase64 ||
      promo.productoImagenBase64 ||
      promo.producto?.imagenBase64;

    const path =
      promo.productoImgPath ||
      promo.productoImagenPath ||
      promo.producto?.imagenPath;

    return !!(b64 || path);
  }

  // 🔍 Aquí engancharás tu lector de QR real (modal, capacitor, etc.)
  async abrirScanQr() {
    // Si no hay usuario logueado, mándalo a registro
    if (!this.UsuarioID) {
      this.router.navigate(['/registro']);
      return;
    }

    const modal = await this.modalCtrl.create({
      component: ModalQRComponent,
      // 👇 CAMBIO 1: Usamos una clase nueva para pantalla completa
      cssClass: 'modal-fullscreen', 
      componentProps: {
        codigoParametro: '', 
      },
      // 👇 CAMBIO 2: ELIMINAMOS los breakpoints para que use el 100% natural
      // breakpoints: [0, 0.9],   <-- BORRAR
      // initialBreakpoint: 0.9,  <-- BORRAR
    });

    await modal.present();
    await modal.onDidDismiss();
  }

  irACompra() {
    // ruta de la pantalla "Compra" (empresas.network)
    this.router.navigate(['/dashboard/network']);
  }

  irAVende() {
    // ya estás en vende, pero por si acaso
    this.router.navigate(['/vende']);
  }
}