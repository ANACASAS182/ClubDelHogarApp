import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { Empresa } from 'src/app/models/Empresa';
import { Promocion } from 'src/app/models/Promocion';
import { Usuario } from 'src/app/models/Usuario';

import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { PromocionesService } from 'src/app/services/api.back.services/promociones.service';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';

import { PromocionComponent } from 'src/app/modals/promocion/promocion.component';
import { ReferidoRegistroModalComponent } from 'src/app/modals/referido.registro.modal/referido.registro.modal.component';

import { CategoriasService, Categoria } from 'src/app/services/api.back.services.cdh/categorias.service';
import { PrefsStorage } from 'src/app/core/utils/prefs.storage';
import { TokenService } from 'src/app/services/token.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-empresas.network',
  templateUrl: './empresas.network.page.html',
  styleUrls: ['./empresas.network.page.scss'],
  standalone: false,
})
export class EmpresasNetworkPage implements OnInit {

  UsuarioID = 0;
  esSocio = false;

  empresas: Empresa[] = [];
  promociones: any[] = [];

  cargandoPromociones = true;
  cargandoEmpresas = true;

  empresaActualId: number | null = null;

  categorias: Categoria[] = [];
  categoriaSeleccionada: any = null;

  nombreUsuario = '';
  correoUsuario = '';

  esInvitado: boolean = true;

  // 🔒 para no disparar syncUsuario 20 veces a la vez
  private syncingUsuario = false;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private empresaService: EmpresaService,
    private promocionesService: PromocionesService,
    private usuarioService: UsuarioService,
    private categoriasService: CategoriasService,
    private modalCtrl: ModalController,
    private tokenService: TokenService,
    private prefs: PrefsStorage,
    private cdr: ChangeDetectorRef
  ) {

    // 🧷 PARCHE DURO:
    // Cada vez que realmente se navega a /dashboard/network
    // volvemos a sincronizar el usuario (ideal para Android / Capacitor)
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects || e.url || '';
        if (url.startsWith('/dashboard/network')) {
          console.log('[EmpresasNetwork] NavigationEnd -> syncUsuario()');
          this.syncUsuario();
        }
      });
  }

  async ngOnInit() {
    this.cargandoPromociones = true;
    this.cargandoEmpresas = true;

    // 1) Categorías
    this.categoriasService.getCategorias().subscribe({
      next: (resp) => {
        this.categorias = resp.data || [];
        console.log('[Categorias]', this.categorias);
      },
      error: (err) => {
        console.error('Error cargando categorías', err);
        this.categorias = [];
      }
    });

    // 2) Promos Network
    this.promocionesService.GetPromosNetwork().subscribe({
      next: (resp) => {
        this.promociones = (resp.data || []).map((x: any) => {
          const empresaUbicacion =
            x.empresaUbicacion ??   // 👈 nombre real que manda el backend
            x.EmpresaUbicacion ??   // por si en algún otro endpoint viene así
            x.ubicacion ??
            x.Ubicacion ??
            '';

          return {
            productoID: x.ProductoID,
            nombre: x.ProductoNombre,
            descripcion: x.ProductoDescripcion,
            productoImgBase64: x.ProductoImagenBase64,
            empresaID: x.EmpresaID,
            empresaNombre: x.EmpresaNombre,
            empresaLogotipoBase64: x.EmpresaLogotipoBase64,
            empresaUbicacion,       // 👈 ahora sí llega al modal
            categoriaID: x.CategoriaID,
            categoriaNombre: x.CategoriaNombre,
          };
        });


        this.cargandoPromociones = false;
      },
      error: () => {
        this.promociones = [];
        this.cargandoPromociones = false;
      }
    });
  }

  // 🔁 Cada vez que entras a la pestaña (Ionic lifecycle)
  async ionViewWillEnter() {
    console.log('[EmpresasNetwork] ionViewWillEnter');
    await this.syncUsuario();
  }

  // 🔹 Sincroniza usuario usando cache + backend si hay token
  private async syncUsuario() {
    if (this.syncingUsuario) {
      return;
    }
    this.syncingUsuario = true;
    console.log('[EmpresasNetwork] syncUsuario() start');

    this.cargandoEmpresas = true;

    try {
      // 1) Cache primero
      const cacheRaw = localStorage.getItem('usuario-actual');
      if (cacheRaw) {
        try {
          const u = JSON.parse(cacheRaw) as Usuario;
          console.log('[EmpresasNetwork] usuario desde cache:', u);
          this.aplicarUsuario(u);
        } catch (e) {
          console.warn('[EmpresasNetwork] error parseando cache usuario-actual', e);
          this.marcarInvitado();
        }
      } else {
        console.log('[EmpresasNetwork] sin usuario-actual en cache');
      }

      // 2) Refrescar back si hay token
      const token = await this.tokenService.getToken?.();
      console.log('[EmpresasNetwork] token =', token);

      if (!token) {
        if (!this.UsuarioID) {
          this.marcarInvitado();
        } else {
          this.cargandoEmpresas = false;
        }
        return;
      }

      this.usuarioService.getUsuario(true).subscribe({
        next: (resp) => {
          console.log('[EmpresasNetwork] getUsuario resp =', resp);
          if (resp?.data) {
            this.aplicarUsuario(resp.data);
            localStorage.setItem('usuario-actual', JSON.stringify(resp.data));
          } else if (!this.UsuarioID) {
            this.marcarInvitado();
          } else {
            this.cargandoEmpresas = false;
          }
        },
        error: (err) => {
          console.error('[EmpresasNetwork] error getUsuario', err);
          if (!this.UsuarioID) {
            this.marcarInvitado();
          } else {
            this.cargandoEmpresas = false;
            this.cdr.detectChanges();
          }
        }
      });
    } finally {
      this.syncingUsuario = false;
    }
  }

  private marcarInvitado() {
    this.UsuarioID = 0;
    this.nombreUsuario = '';
    this.correoUsuario = '';
    this.esInvitado = true;
    this.esSocio = false;
    this.cargandoEmpresas = false;
    console.log('[EmpresasNetwork] marcarInvitado -> esInvitado =', this.esInvitado);
    this.cdr.detectChanges();
  }

  private aplicarUsuario(user: Usuario | null) {
    if (!user) {
      this.marcarInvitado();
      return;
    }

    const u: any = user;

    this.UsuarioID =
      u.id ??
      u.ID ??
      u.usuarioID ??
      u.UsuarioID ??
      u.usuarioId ??
      0;

    const nombres   = u.nombres   ?? u.Nombres   ?? '';
    const apellidos = u.apellidos ?? u.Apellidos ?? '';

    this.nombreUsuario = `${nombres} ${apellidos}`.trim();
    this.correoUsuario = (u.email ?? u.Email ?? '').trim();

    const rolId = Number(
      u.rolesID ??
      u.RolesID ??
      u.rolID   ??
      u.rolId   ??
      u.RolID   ??
      u.rol?.id ??
      u.rol     ??
      0
    );

    this.esSocio = (rolId === 2);
    this.esInvitado = !this.UsuarioID;

    console.log('[EmpresasNetwork] aplicarUsuario -> UsuarioID =', this.UsuarioID, 'rolId =', rolId, 'esInvitado =', this.esInvitado);

    this.cargandoEmpresas = false;
    this.cdr.detectChanges();
  }

  // ===== Helpers UI =====

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
    // 🔎 sigue el mismo seguro por si acaso
    if (!this.UsuarioID) {
      const cacheRaw = localStorage.getItem('usuario-actual');
      if (!cacheRaw) {
        console.log('[EmpresasNetwork] Usuario invitado real, redirigiendo a registro');
        this.router.navigate(['/registro']);
        return;
      }

      try {
        const u = JSON.parse(cacheRaw) as Usuario;
        this.aplicarUsuario(u);
      } catch {
        console.log('[EmpresasNetwork] cache inválido, redirigiendo a registro');
        this.router.navigate(['/registro']);
        return;
      }
    }

    let formDirty = false;

    const promocionAdaptada: Promocion = {
      ...(promo as any),
      iD: promo.iD ?? promo.ID ?? promo.productoID ?? promo.ProductoID ?? 0,
      nombre: promo.nombre ?? promo.nombrePromocion ?? promo.titulo ?? '',
      descripcion: promo.descripcion ?? promo.detalle ?? '',
      empresaNombre:
        promo.empresaNombre ??
        promo.empresa?.nombreComercial ??
        promo.empresa?.nombre ??
        '',
    };

    const modal = await this.modalCtrl.create({
      component: PromocionComponent,
      cssClass: 'modal-redondeado promo-modal-full',
      componentProps: {
        promoSeleccionada: promocionAdaptada,
        UsuarioID: this.UsuarioID,
        setFormDirtyStatus: (dirty: boolean) => (formDirty = dirty),
      }
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

  irACompra() {
    this.router.navigate(['/compra']);
  }

  irAVende() {
    this.router.navigate(['/vende']);
  }

  refreshPromos() {
    if (!this.promociones || this.promociones.length === 0) {
      return;
    }

    const arr = [...this.promociones];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    this.promociones = arr;
    console.log('[EmpresasNetwork] promociones aleatorizadas');
  }

}