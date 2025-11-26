import { Component, OnInit } from '@angular/core';
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
  // 👇 AQUÍ el cambio importante: que no sea Promocion[]
  promociones: any[] = [];

  cargandoPromociones = true;
  cargandoEmpresas = true;

  empresaActualId: number | null = null;

  categorias: Categoria[] = [];
  categoriaSeleccionada: any = null;

  nombreUsuario = '';
  correoUsuario = '';

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private empresaService: EmpresaService,
    private promocionesService: PromocionesService,
    private usuarioService: UsuarioService,
    private categoriasService: CategoriasService,
    private modalCtrl: ModalController,
    private tokenService: TokenService,
    private prefs: PrefsStorage
  ) {}

  ngOnInit() {
    this.cargandoPromociones = true;
    this.cargandoEmpresas = true;

    // Cargar categorías
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

    // Cargar promos del endpoint promos-network
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
    // Usuario (para saber rol / embajador etc.)
    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        const user = response.data;

        if (!user) {
          this.cargandoEmpresas = false;
          this.cargandoPromociones = false;
          return;
        }

        this.UsuarioID = user.id;

        // 🔹 Nombre y correo para el header
        this.nombreUsuario = `${user.nombres ?? ''} ${user.apellidos ?? ''}`.trim();
        this.correoUsuario = (user.email ?? '').trim();

        // ⚠️ roles a prueba de balas
        const rolId = Number(
          (user as any)?.rolesID ?? (user as any)?.RolesID ??
          (user as any)?.rolID   ?? (user as any)?.rolId   ??
          (user as any)?.rol?.id ?? (user as any)?.rol     ?? 0
        );

        this.esSocio = (rolId === 2);
        console.log('[EmpresasNetwork] rolId =', rolId, 'esSocio =', this.esSocio);

        // ya terminó la carga de "datos de usuario / empresas"
        this.cargandoEmpresas = false;
      },
      error: _ => {
        this.cargandoEmpresas = false;
        this.cargandoPromociones = false;
      }
    });
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
    // Ajusta la ruta si tu pantalla de perfil/config es otra
    this.router.navigate(['/configuracion/general']);
  }

  async cerrarSesion() {
    // quita token JWT
    await this.tokenService.removeToken();

    // limpia preferencias de "recordar sesión"
    await this.prefs.remove('correoAlmacenado');
    await this.prefs.remove('passwordAlmacenado');
    await this.prefs.remove('nombreAlmacenado');

    // por si acaso usas estos en CDH
    localStorage.removeItem('usuario-actual');
    localStorage.removeItem('cdh_tel');

    // manda de regreso al login CDH
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
    // 🚫 Usuario 27 = invitado / sin registro
    if (!this.UsuarioID || this.UsuarioID === 27) {
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
}