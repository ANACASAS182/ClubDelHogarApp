import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { Empresa } from 'src/app/models/Empresa';
import { Promocion } from 'src/app/models/Promocion';
import { Usuario } from 'src/app/models/Usuario';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';

import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { PromocionesService } from 'src/app/services/api.back.services/promociones.service';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';

import { PromocionComponent } from 'src/app/modals/promocion/promocion.component';
import { ReferidoRegistroModalComponent } from 'src/app/modals/referido.registro.modal/referido.registro.modal.component';

import { CategoriasService, Categoria } from 'src/app/services/api.back.services.cdh/categorias.service';
import { PrefsStorage } from 'src/app/core/utils/prefs.storage';
import { TokenService } from 'src/app/services/token.service';

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

  // 👇 flag explícito para el header
  esInvitado: boolean = true;

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
  ) {}

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
        this.promociones = (resp.data || []).map((x: any) => ({
          productoID: x.ProductoID,
          nombre: x.ProductoNombre,
          descripcion: x.ProductoDescripcion,
          productoImgBase64: x.ProductoImagenBase64,
          empresaID: x.EmpresaID,
          empresaNombre: x.EmpresaNombre,
          empresaLogotipoBase64: x.EmpresaLogotipoBase64,
          categoriaID: x.CategoriaID,
          categoriaNombre: x.CategoriaNombre,
        }));
        this.cargandoPromociones = false;
      },
      error: () => {
        this.promociones = [];
        this.cargandoPromociones = false;
      }
    });
  }

  async ionViewWillEnter() {
  console.log('[EmpresasNetwork] ionViewWillEnter');

  // 0) Leer usuario cacheado que guardó el login
  const cacheRaw = localStorage.getItem('usuario-actual');
  if (cacheRaw) {
    try {
      const u = JSON.parse(cacheRaw) as Usuario;
      console.log('[EmpresasNetwork] usuario desde cache:', u);
      this.aplicarUsuario(u);          // 👈 usa el método
    } catch (e) {
      console.warn('[EmpresasNetwork] error parseando usuario-actual', e);
      this.marcarInvitado();
    }
  } else {
    this.marcarInvitado();
  }

  // 0.1) Nombre rápido desde prefs (solo si no se seteo antes)
  if (!this.nombreUsuario) {
    const nombrePref = await this.prefs.get('nombreAlmacenado');
    if (nombrePref) {
      this.nombreUsuario = nombrePref;
      if (this.UsuarioID > 0) this.esInvitado = false;
    }
  }

  // 1) Refrescar usuario desde el backend (en segundo plano)
  this.cargandoEmpresas = true;
  this.usuarioService.getUsuario(true).subscribe({
    next: (response: GenericResponseDTO<Usuario>) => {
      console.log('[EmpresasNetwork] getUsuario resp:', response);
      this.aplicarUsuario(response.data ?? null);   // 👈 usa el método
    },
    error: (err) => {
      console.error('[EmpresasNetwork] getUsuario error:', err);

      if ((err?.status === 401 || err?.status === 403) && !this.UsuarioID) {
        this.marcarInvitado();
      } else {
        this.cargandoEmpresas = false;
      }
      this.cdr.detectChanges();  // por si acaso
    }
  });
}


  private marcarInvitado() {
    this.UsuarioID = 0;
    this.nombreUsuario = '';
    this.correoUsuario = '';
    this.esInvitado = true;
    this.cargandoEmpresas = false;
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

    this.marcarInvitado();           // por si en algún momento no rediriges
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  ensureDataUrl(b64?: string): string {
    if (!b64) return '';
    const clean = (b64 || '').trim().replace(/\s+/g, ''); // quita CR/LF/espacios
    if (clean.startsWith('data:')) return clean;
    return `data:image/png;base64,${clean}`;
  }

  // Lo dejo recibiendo any por si algún día abres este modal desde aquí
    async abrirModalPromocion(promo: any) {
     // 🚫 Usuario invitado / sin registro
      if (!this.UsuarioID) {
        console.log('[EmpresasNetwork] Usuario invitado, redirigiendo a registro');
        this.router.navigate(['/registro']);
        return;
      }
    let formDirty = false;

    // Adaptamos el objeto que viene de GetPromosNetwork
    const promocionAdaptada: Promocion = {
      ...(promo as any),

      // ID que usa el backend para generar el QR
      iD:
        promo.iD ??
        promo.ID ??
        promo.productoID ??
        promo.ProductoID ??
        0,

      // nombre de la promo
      nombre:
        promo.nombre ??
        promo.nombrePromocion ??
        promo.titulo ??
        '',

      // descripción
      descripcion:
        promo.descripcion ??
        promo.detalle ??
        '',

      // nombre de la empresa
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
      // 👈 sin breakpoints ni initialBreakpoint
    });

    await modal.present();
    await modal.onDidDismiss();
  }

  // 👇 Aquí también cambiamos el tipo de retorno a any[]
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

    // si no hay nada, regresa string vacío
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
    // TODO: ajusta la ruta a donde debe ir la parte de “Compra”
    this.router.navigate(['/compra']);
    // o console.log('Ir a compra');
  }

  irAVende() {
    // TODO: ajusta la ruta a donde debe ir la parte de “Vende”
    this.router.navigate(['/vende']);
    // o console.log('Ir a vende');
  }

  private aplicarUsuario(user: Usuario | null) {
  if (!user) {
    // si no hay usuario y no había cache → invitado
    if (!this.UsuarioID) {
      this.marcarInvitado();
    }
    this.cdr.detectChanges();
    return;
  }

  this.UsuarioID = (user as any).id ?? (user as any).ID ?? 0;

  this.nombreUsuario = `${user.nombres ?? ''} ${user.apellidos ?? ''}`.trim();
  this.correoUsuario = (user.email ?? '').trim();

  const rolId = Number(
    (user as any)?.rolesID ?? (user as any)?.RolesID ??
    (user as any)?.rolID   ?? (user as any)?.rolId   ??
    (user as any)?.rol?.id ?? (user as any)?.rol     ?? 0
  );

  this.esSocio = (rolId === 2);
  this.esInvitado = !this.UsuarioID;   // si hay ID > 0 ⇒ NO invitado

  console.log('[EmpresasNetwork] aplicarUsuario -> esInvitado =', this.esInvitado);

  // cache para la siguiente vez
  localStorage.setItem('usuario-actual', JSON.stringify(user));

  this.cargandoEmpresas = false;

  // 👈 AQUI forzamos que Angular repinte la vista
  this.cdr.detectChanges();
}

}