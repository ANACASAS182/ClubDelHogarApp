import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { EstatusReferenciaEnum } from 'src/app/enums/estatus.referencia.enum';
import { RolesEnum } from 'src/app/enums/roles.enum';
import { Usuario } from 'src/app/models/Usuario';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { ReferidoService } from 'src/app/services/api.back.services/referido.service';
import { ProductoService } from 'src/app/services/api.back.services/producto.service'; // ← tu service

type RefItem = {
  id: number;
  nombre?: string;
  email?: string;
  celular?: string;
  telefono?: string;
  producto?: string;
  productoVigente?: boolean;
  empresa?: string;
  embajador?: string;
  estatusRerefencia?: string;
  estatus?: string | null;   // <-- quita el `number`
  _raw?: any;  
  vigencia?: any; fechaVigencia?: any; vigenteHasta?: any; vigenciaHasta?: any;
  fechaFinVigencia?: any; fechaVencimiento?: any; finVigencia?: any;
};

@Component({
  selector: 'app-referencias',
  templateUrl: './referencias.page.html',
  styleUrls: ['./referencias.page.scss'],
  standalone: false
})
export class ReferenciasPage implements OnInit, OnDestroy {

  items: RefItem[] = [];
  loading = false;

  // paginación
  page = 0;
  size = 20;
  total = 0;
  canLoadMore = true;

  // filtros
  query = '';
  statusFilter: EstatusReferenciaEnum | 'all' | null = 'all';
  estatus: { nombre: string; valor: number }[] = [];

  // contexto
  rolUsuario: RolesEnum | undefined;
  userId = 0;
  empresaID = 0;

  // producto
  productos: any[] = [];
  productoID = 0; // requerido para buscar

  skeletonRows = Array.from({ length: 6 });

  constructor(
    private usuarioService: UsuarioService,
    private referidoService: ReferidoService,
    private productoService: ProductoService,
    private toast: ToastController
  ) {}

  async ngOnInit() {
    this.loading = true;
    try {
      // Usuario actual
      const respUser: any = await firstValueFrom(this.usuarioService.getUsuario());
      const user: Usuario = respUser?.data;
      this.userId = user?.id ?? 0;

      const roleVal = (user as any)?.rolesID ?? (user as any)?.rolesId ?? 0;
      this.rolUsuario = roleVal as RolesEnum;

      // Empresa del usuario
      const emp = await firstValueFrom(this.usuarioService.getEmpresaByUsuario(this.userId, true));
      this.empresaID = emp?.data?.id ?? emp?.data?.ID ?? 0;

      // Productos de la empresa
      const respProd = await firstValueFrom(this.productoService.getAllProductosEmpresa(this.empresaID));
      this.productos = respProd?.data ?? [];

      // Si hay 1 producto, autoselección
      if (this.productos.length === 1) {
        this.productoID = this.productos[0]?.id ?? this.productos[0]?.ID ?? 0;
      }

      await this.reload();
    } catch (e) {
      console.error('Init referencias error', e);
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {}

  async doRefresh(ev: any) {
    await this.reload();
    ev.target.complete();
  }

  async onSearch(ev: CustomEvent) {
    this.query = String((ev as any).detail?.value ?? '').trim();
    await this.reload();
  }

  async onStatusChange(ev: CustomEvent) {
    const val = (ev as any).detail?.value;
    this.statusFilter = val === 'all' ? 'all' : (Number(val) as EstatusReferenciaEnum);
    await this.reload();
  }

  async onProductoChange(ev: CustomEvent) {
    const raw = (ev as any).detail?.value;
    this.productoID = Number(raw) || 0;
    console.log('[REF] onProductoChange -> productoID:', this.productoID);
    await this.reload();
  }

  async loadMore(ev: any) {
    try {
      this.page++;
      const extra = await this.fetch();
      this.items = this.items.concat(extra);
      this.updateCanLoadMore();
    } catch (e) {
      console.error(e);
    } finally {
      ev.target.complete();
    }
  }

  async reload() {
    this.page = 0;
    this.items = [];
    this.canLoadMore = true;
    const first = await this.fetch();
    this.items = first;
    this.updateCanLoadMore();
  }

  private updateCanLoadMore() {
    this.canLoadMore = this.items.length < this.total;
  }

  private mapDtoToRefItem(r: any): RefItem {
    // toma el texto de estatus de cualquier variante y lo fuerza a string sin espacios
    const estatusTxt =
      (r?.estatus ??
      r?.Estatus ??
      r?.estatusReferencia ??
      r?.EstatusReferencia ??
      r?.estatusreferencia ??  // <- la que trae tu API
      '')
      ?.toString()
      ?.trim();

    return {
      id: r?.id ?? r?.ID ?? 0,
      nombre: r?.nombre ?? r?.Nombre ?? r?.nombreCompleto ?? r?.NombreCompleto ?? '',
      email: r?.email ?? r?.Email ?? '',
      celular: r?.celular ?? r?.Celular ?? r?.telefono ?? r?.Telefono ?? '',
      telefono: r?.celular ?? r?.Celular ?? r?.telefono ?? r?.Telefono ?? '',
      empresa: r?.empresa ?? r?.Empresa ?? r?.empresaNombre ?? r?.EmpresaNombre ?? '',
      producto: r?.producto ?? r?.Producto ?? r?.productoNombre ?? r?.ProductoNombre ?? '',
      productoVigente: r?.productoVigente ?? r?.ProductoVigente ?? r?.vigente ?? r?.Vigente ?? null,
      embajador: r?.embajador ?? r?.Embajador ?? r?.usuarioNombre ?? r?.UsuarioNombre ?? '',
      estatus: null,     // lo resolvemos al pintar
      _raw: r            // <-- guarda el original
    };
  }

  getEstatus(item: RefItem): string {
    const r = item?._raw ?? item;

    // Texto directo (todas las variantes comunes)
    const txt = (
      r?.estatus ??
      r?.Estatus ??
      r?.estatusRerefencia ??         // typo previo
      r?.estatusReferencia ??
      r?.EstatusReferencia ??
      r?.estatusreferencia ??         // así suele venir en tu API
      ''
    )?.toString().trim();

    if (txt) return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();

    // Fallback por ID/Enum
    const idRaw =
      r?.estatusReferenciaID ??
      r?.EstatusReferenciaID ??
      r?.estatusreferenciaid ??
      r?.estatusReferenciaEnum ??
      r?.EstatusReferenciaEnum ??
      r?.estatusreferenciaenum ?? 0;

    const id = Number(idRaw) || 0;
    if (id) {
      return id === 1 ? 'Creado' : id === 2 ? 'Seguimiento' : id === 3 ? 'Cerrado' : '—';
    }

    return '—';
  }

  private async fetch(): Promise<RefItem[]> {
    this.loading = this.items.length === 0;
    try {
      if (!this.empresaID) { this.total = 0; return []; }

      const resp: any = await firstValueFrom(
        this.referidoService.getReferidosByEmpresaPaginated({
          empresaID: this.empresaID,
          productoID: this.productoID, // 0 => “Todos”
          page: this.page,
          size: this.size,
          sortBy: 'id',
          sortDir: 'desc',
          searchQuery: this.query || '',
          statusEnum: (typeof this.statusFilter === 'number') ? this.statusFilter : undefined,
        })
      );

      // parseo flexible
      let itemsRaw: any[] = [];
      let total = 0;
      if (resp?.data?.items) { itemsRaw = resp.data.items; total = resp.data.total ?? itemsRaw.length; }
      else if (resp?.data?.Items) { itemsRaw = resp.data.Items; total = resp.data.Total ?? itemsRaw.length; }
      else if (resp?.items) { itemsRaw = resp.items; total = resp.total ?? itemsRaw.length; }
      else if (Array.isArray(resp?.data)) { itemsRaw = resp.data; total = itemsRaw.length; }
      else if (Array.isArray(resp)) { itemsRaw = resp; total = itemsRaw.length; }

      // FILTRO EN CLIENTE por producto (por ID o por NOMBRE si el ID no viene en la respuesta)
      const pid = Number(this.productoID) || 0;
      if (pid > 0) {
        const selectedName = (this.getSelectedProductName() || '').toLowerCase();

        itemsRaw = itemsRaw.filter(r => {
          // 1) Intento por ID (si el item trae ID de producto)
          const rid =
            Number(
              r?.productoID ?? r?.ProductoID ??
              r?.productoId ?? r?.ProductoId ??
              r?.producto?.id ?? r?.producto?.ID ?? 0
            ) || 0;

          if (rid > 0) {
            return rid === pid;
          }

          // 2) Fallback por NOMBRE (la API actual solo trae 'producto': "Curso IA Nivel 2")
          const rname = String(r?.producto ?? r?.Producto ?? '').toLowerCase().trim();
          return selectedName ? rname === selectedName : true;
        });

        total = itemsRaw.length;
      }


      this.total = total;

      const mapped = (itemsRaw || []).map(r => this.mapDtoToRefItem(r));
      for (const r of mapped) if (!r.celular && r.telefono) r.celular = r.telefono;

      return mapped;
    } catch (e) {
      console.error('fetch referencias error', e);
      return [];
    } finally {
      this.loading = false;
    }
  }


  getFechaVigencia(element: any): Date | null {
    if (!element || typeof element !== 'object') return null;
    const cand = ['vigencia','fechaVigencia','vigenteHasta','vigenciaHasta','fechaFinVigencia','fechaVencimiento','finVigencia'];
    for (const k of cand) {
      const v = element[k];
      if (v == null) continue;
      if (v instanceof Date) return v;
      if (typeof v === 'string' || typeof v === 'number') {
        const d = new Date(v); if (!isNaN(d.getTime())) return d;
      }
    }
    return null;
  }

  async copyPhone(r: RefItem) {
    const phone = r.celular || r.telefono || '';
    if (!phone) return;
    await navigator.clipboard.writeText(phone);
    const t = await this.toast.create({ message: 'Teléfono copiado', duration: 1200, icon: 'checkmark' });
    t.present();
  }

  call(r: RefItem) {
    const phone = r.celular || r.telefono || '';
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  }

  whatsapp(r: RefItem) {
    const phone = (r.celular || r.telefono || '').replace(/\D/g, '');
    if (!phone) return;
    const normalized = phone.startsWith('52') || phone.length > 10 ? phone : `52${phone}`;
    window.open(`https://wa.me/${normalized}`, '_blank');
  }

  getProductoId(p: any): number {
    // Devuelve el id numérico sin importar el nombre de la propiedad
    const val = p?.id ?? p?.ID ?? p?.productoID ?? p?.ProductoID ?? p?.idProducto ?? 0;
    return Number(val) || 0;
  }

  getProductoNombre(p: any): string {
    return p?.nombre || p?.Nombre || p?.descripcion || p?.Descripcion || '';
  }

  private getSelectedProductName(): string | null {
    if (!this.productoID || !this.productos?.length) return null;
    const p = this.productos.find(x => this.getProductoId(x) === this.productoID);
    const name = p ? (p.nombre || (p as any).Nombre || p.descripcion || (p as any).Descripcion) : '';
    return (name || '').toString().trim() || null;
  }


  noop() {}
}
