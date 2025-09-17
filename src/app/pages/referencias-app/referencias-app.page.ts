import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, IonRefresher, ModalController } from '@ionic/angular';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ReferenciasAppService } from 'src/app/services/feature/referencias-app.service';
import { ReferenciaItemDTO } from 'src/app/models/DTOs/referencia-app.dto';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
// después (relativos desde src/app/pages/referencias-app/)
import { RolesEnum } from '../../enums/roles.enum';

// ⬇️ Ajusta estas rutas a las que tengas en tu repo
import { ModalQRComponent } from 'src/app/modals/modal-qr/modal-qr.component';
import { ReferidoSeguimientoModalComponent } from '../../modals/referido.seguimiento.modal/referido.seguimiento.modal.component';

@Component({
  selector: 'app-referencias-app',
  templateUrl: './referencias-app.page.html',
  styleUrls: ['./referencias-app.page.scss'],
  standalone: false
})
export class ReferenciasAppPage implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infinite!: IonInfiniteScroll;
  @ViewChild(IonRefresher) refresher!: IonRefresher;

  loading = true;
  items: ReferenciaItemDTO[] = [];
  total = 0;

  page = 0;
  size = 20;
  end = false;

  search$ = new Subject<string>();
  search = '';
  estatus?: number;
  empresaId?: number;
  usuarioId?: number;

  rol?: RolesEnum;
  isAdmin = false;
  isSocio = false;

  private destroy$ = new Subject<void>();

  constructor(
    private api: ReferenciasAppService,
    private usuarioSrv: UsuarioService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.usuarioSrv.getUsuario().subscribe(u => {
      const data = u.data;

      const roleVal: number =
        (data as any)?.rolesID
        ?? (data as any)?.rolesId
        ?? (data as any)?.roles?.enumValue
        ?? 0;

      this.rol = roleVal as RolesEnum;
      this.isAdmin = roleVal === 1;
      this.isSocio = roleVal === 2;

      const userId = (data as any)?.id ?? (data as any)?.ID;

      if (this.isSocio) {
        this.usuarioSrv.getEmpresaByUsuario(userId).subscribe(r => {
          this.empresaId = r?.data?.id ?? r?.data?.ID;
          this.resetAndLoad();
        });
      } else {
        this.resetAndLoad();
      }
    });

    this.search$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(q => { this.search = q ?? ''; this.resetAndLoad(); });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  resetAndLoad() {
    this.page = 0; this.end = false; this.items = []; this.load();
  }

  async refresh(ev?: any) {
    this.resetAndLoad();
    setTimeout(() => ev?.target?.complete(), 300);
  }

  load(ev?: any) {
    if (this.end) { ev?.target?.complete(); return; }
    this.loading = this.page === 0;

    this.api.getPage({
      page: this.page, size: this.size,
      search: this.search,
      empresaId: this.empresaId,
      usuarioId: this.usuarioId,
      estatus: this.estatus
    }).subscribe({
      next: (res) => {
        this.total = res.total ?? 0;
        this.items = [...this.items, ...(res.items ?? [])];
        this.page++;

        if (this.items.length >= this.total) {
          this.end = true;
          if (this.infinite) this.infinite.disabled = true;
        } else {
          if (this.infinite) this.infinite.disabled = false;
        }
      },
      error: () => {},
      complete: () => { this.loading = false; ev?.target?.complete(); }
    });
  }

  setEstatus(v?: number) { this.estatus = v; this.resetAndLoad(); }
  clearEstatus() { this.setEstatus(undefined); }
  setUsuario(id?: number) { this.usuarioId = id; this.resetAndLoad(); }
  clearUsuario() { this.setUsuario(undefined); }

  async openQR(codigo?: string) {
    if (!codigo) return;
    const { data } = await this.api.getQR(codigo).toPromise() as any;
    const modal = await this.modalCtrl.create({
        component: ModalQRComponent,
        cssClass: 'modal-empresa',
        componentProps: { imagenBase64: data }
    });
    await modal.present();
  }

  async openSeguimiento(id: number) {
    const modal = await this.modalCtrl.create({
      component: ReferidoSeguimientoModalComponent,
      cssClass: 'modal-empresa',
      componentProps: { id }
    });
    await modal.present();
    await modal.onDidDismiss();
    this.resetAndLoad();
  }

  getFechaVigencia(item: any): Date | null {
    const cand = ['vigencia','fechaVigencia','vigenteHasta','vigenciaHasta','fechaFinVigencia','fechaVencimiento','finVigencia'];
    for (const k of cand) {
      const v = item?.[k];
      if (v == null) continue;
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }
}