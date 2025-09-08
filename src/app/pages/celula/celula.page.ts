import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { UsuarioService, MiCelulaDisplay } from 'src/app/services/api.back.services/usuario.service';
import { InvitarComponent } from 'src/app/modals/invitar/invitar.component';
import { ModalController } from '@ionic/angular';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Usuario } from 'src/app/models/Usuario';

type RoleMini = 'padre' | 'yo' | 'hijo';

// === si algún día queremos volver a mostrar el padre, ponemos en true
const SHOW_PARENT = false;

class MiniNode {
  x = 0; y = 0; w = 180; h = 60;
  nombre = ''; contacto = ''; role: RoleMini = 'hijo';
  rutaDesdeBus?: string; // segmento vertical bus -> hijo
}

@Component({
  selector: 'app-celula',
  templateUrl: './celula.page.html',
  styleUrls: ['./celula.page.scss'],
  standalone: false
})
export class CelulaPage implements OnInit {

  constructor(
    private _usuarioService: UsuarioService,
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef
  ) {}

  @ViewChild('miniSvg', { static: false }) miniSvg!: ElementRef<SVGSVGElement>;
    @ViewChild('miniViewport', { static: false }) miniViewport!: ElementRef<HTMLDivElement>;

  celula: MiCelulaDisplay | null = null;
  UsuarioID = 0;
  cargandoCelula = true;

  // escena mini
  miniWidth = 960;
  miniHeight = 420;

  padreNode?: MiniNode;
  yoNode?: MiniNode;
  hijosNodes: MiniNode[] = [];

  // conectores
  linkPadreYo = '';       // (no se usa cuando SHOW_PARENT=false)
  busVerticalPath = '';   // vertical yo -> bus
  busHorizontalPath = ''; // horizontal bus

  // layout
  private readonly topMargin = 40;
  private readonly gapYoHijos = 36;
  private readonly colGapX = 220;

  // text measure
  private ctx: CanvasRenderingContext2D | null = null;

  ngOnInit(): void {
    const canvas = document.createElement('canvas');
    this.ctx = canvas.getContext('2d');
    this.cargandoCelula = true;

    this._usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        this.UsuarioID = response.data.id;

        this._usuarioService.getMiCelula(this.UsuarioID, 4).subscribe({
          next: (data) => {
            this.celula = data;
            this.cargandoCelula = false;
            // asegura que el SVG ya está en el DOM
            this.cdr.detectChanges();
            this.buildMiniChart();
          },
          error: () => { this.cargandoCelula = false; }
        });
      }
    });
  }

  // Helpers de datos
  private nameOf(u?: any) {
    if (!u) return '';
    if (u.nombre) return String(u.nombre);
    return [u.nombres, u.apellidos].filter(Boolean).join(' ').trim();
  }

  private contactOf(u?: any) {
    if (!u) return '';
    return u.contacto ?? u.email ?? u.celular ?? '';
  }

  private measureW(nombre: string, contacto: string) {
    const padLeft = 14;
    const padRight = 14;
    if (!this.ctx) return 180;
    this.ctx.font = '16px sans-serif';
    const w1 = this.ctx.measureText(nombre || '').width;
    this.ctx.font = '12px sans-serif';
    const w2 = this.ctx.measureText(contacto || '').width;
    return Math.max(180, Math.ceil(Math.max(w1, w2) + padLeft + padRight));
  }

  // Construye la escena (líneas rectas tipo organigrama en L)
  private buildMiniChart() {
    const hostW = this.miniSvg?.nativeElement?.parentElement?.clientWidth || 960;
    this.miniWidth = Math.max(720, Math.min(1200, hostW - 32));

    // --- YO ---
    const yo = new MiniNode();
    yo.role = 'yo';
    yo.nombre = this.nameOf(this.celula?.yo) || 'Yo';
    yo.contacto = this.contactOf(this.celula?.yo);
    yo.w = this.measureW(yo.nombre, yo.contacto);
    yo.h = 60;
    yo.x = Math.round(this.miniWidth / 2 - yo.w / 2);
    yo.y = this.topMargin; // siempre fijo arriba (NO mostramos padre)
    this.yoNode = yo;

    // --- PADRE (oculto cuando SHOW_PARENT=false) ---
    if (SHOW_PARENT && this.celula?.padre) {
      const p = new MiniNode();
      p.role = 'padre';
      p.nombre = this.nameOf(this.celula.padre);
      p.contacto = this.contactOf(this.celula.padre);
      p.w = this.measureW(p.nombre, p.contacto);
      p.h = 60;
      p.x = Math.round(yo.x + yo.w / 2 - p.w / 2);
      p.y = yo.y - (32 + p.h);
      this.padreNode = p;

      const cx = Math.round(yo.x + yo.w / 2);
      this.linkPadreYo = `M ${cx} ${p.y + p.h} L ${cx} ${yo.y}`;
    } else {
      this.padreNode = undefined;
      this.linkPadreYo = '';
    }

    // --- HIJOS ---
    const hijos = (this.celula?.hijos || []).slice(0, 4);
    this.hijosNodes = [];
    this.busVerticalPath = '';
    this.busHorizontalPath = '';

    if (hijos.length > 0 && this.yoNode) {
      const yRow = yo.y + yo.h + this.gapYoHijos;
      const nCols = Math.max(1, hijos.length);
      const totalWidth = (nCols - 1) * this.colGapX;
      const firstColCenterX = (this.miniWidth / 2) - totalWidth / 2;

      const rootCx = Math.round(yo.x + yo.w / 2); // centro de Yo
      const busY = Math.round(yo.y + yo.h + Math.floor(this.gapYoHijos / 2));
      const centers: number[] = [];

      hijos.forEach((h, idx) => {
        const node = new MiniNode();
        node.role = 'hijo';
        node.nombre = this.nameOf(h);
        node.contacto = this.contactOf(h);
        node.w = this.measureW(node.nombre, node.contacto);
        node.h = 60;

        const colCenterX = firstColCenterX + idx * this.colGapX;
        node.x = Math.round(colCenterX - node.w / 2);
        node.y = yRow;

        const cx = Math.round(node.x + node.w / 2);
        node.rutaDesdeBus = `M ${cx} ${busY} L ${cx} ${node.y}`;
        centers.push(cx);

        this.hijosNodes.push(node);
      });

      // vertical Yo -> bus
      this.busVerticalPath = `M ${rootCx} ${yo.y + yo.h} L ${rootCx} ${busY}`;

      // horizontal del bus
      if (centers.length === 1) {
        const only = centers[0];
        const left  = Math.min(rootCx, only);
        const right = Math.max(rootCx, only);
        this.busHorizontalPath = `M ${left} ${busY} L ${right} ${busY}`;
      } else {
        this.busHorizontalPath = `M ${Math.min(...centers)} ${busY} L ${Math.max(...centers)} ${busY}`;
      }

      const maxBottom = Math.max(...this.hijosNodes.map(n => n.y + n.h));
      this.miniHeight = Math.max(yRow + 120, maxBottom + 60);
    } else {
      // sin hijos
      this.miniHeight = yo.y + yo.h + 80;
    }
  }

  // Invitar
  async onFabClick() {
    let formDirty = false;
    const modal = await this.modalCtrl.create({
      component: InvitarComponent,
      cssClass: 'modal-redondeado',
      componentProps: {
        EmbajadorReferenteID: this.UsuarioID,
        setFormDirtyStatus: (dirty: boolean) => (formDirty = dirty)
      },
      canDismiss: async () => !formDirty || true
    });
    await modal.present();
  }

  /* ====== Zoom/Pan state ====== */
  zoom = 1;
  panX = 0;
  panY = 0;
  readonly minZoom = 0.5;
  readonly maxZoom = 3;

  /* gesto */
  private isPanning = false;
  private startPanX = 0;
  private startPanY = 0;
  private pointerStartX = 0;
  private pointerStartY = 0;

  /* pinch */
  private isPinching = false;
  private pinchStartDist = 0;
  private pinchStartZoom = 1;
  private pinchCenter = { x: 0, y: 0 };

  get svgTransform() {
    // SVG usa espacio separador
    return `translate(${this.panX} ${this.panY}) scale(${this.zoom})`;
  }

  /* ====== Helpers de zoom ====== */
  private clamp(v:number, a:number, b:number){ return Math.max(a, Math.min(b, v)); }

  zoomIn(step=0.15){ this.setZoom(this.zoom + step); }
  zoomOut(step=0.15){ this.setZoom(this.zoom - step); }

  resetView(){
    this.zoom = 1; this.panX = 0; this.panY = 0;
  }

  fitToViewport(){
    const vp = this.miniViewport?.nativeElement;
    if(!vp) return;
    // margen visual
    const pad = 16;
    const vw = vp.clientWidth - pad*2;
    const vh = vp.clientHeight - pad*2;
    const scale = this.clamp(Math.min(vw/this.miniWidth, vh/this.miniHeight), this.minZoom, this.maxZoom);
    this.zoom = scale;
    // centrado
    this.panX = (vw - this.miniWidth*scale)/2;
    this.panY = (vh - this.miniHeight*scale)/2;
  }

  private setZoom(next:number, origin?:{x:number,y:number}){
    const old = this.zoom;
    const nz = this.clamp(next, this.minZoom, this.maxZoom);
    if(!origin){
      this.zoom = nz;
      return;
    }
    // zoom alrededor de un punto (ajusta pan para mantener el origen fijo)
    const k = nz/old;
    this.panX = origin.x - k*(origin.x - this.panX);
    this.panY = origin.y - k*(origin.y - this.panY);
    this.zoom = nz;
  }

  /* ====== Interacción: rueda / doble tap ====== */
  onWheel(ev:WheelEvent){
    ev.preventDefault();
    const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    const origin = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    const delta = (ev.deltaY>0) ? -0.15 : 0.15;
    this.setZoom(this.zoom + delta, origin);
  }

  onDoubleTap(ev: MouseEvent){
    const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    const origin = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    this.setZoom(this.zoom + 0.25, origin);
  }

  /* ====== Interacción: pan con pointer ====== */
  onPointerDown(ev: PointerEvent){
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
    this.isPanning = true;
    this.pointerStartX = ev.clientX;
    this.pointerStartY = ev.clientY;
    this.startPanX = this.panX;
    this.startPanY = this.panY;
  }
  onPointerMove(ev: PointerEvent){
    if(!this.isPanning || this.isPinching) return;
    this.panX = this.startPanX + (ev.clientX - this.pointerStartX);
    this.panY = this.startPanY + (ev.clientY - this.pointerStartY);
  }
  onPointerUp(_: PointerEvent){
    this.isPanning = false;
  }

  /* ====== Pinch (touch) ====== */
  private dist(t1:Touch,t2:Touch){
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx,dy);
  }
  private center(t1:Touch,t2:Touch, host:DOMRect){
    return { x: ((t1.clientX+t2.clientX)/2) - host.left,
            y: ((t1.clientY+t2.clientY)/2) - host.top };
  }

  onTouchStart(ev: TouchEvent){
    if(ev.touches.length===2){
      const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
      this.isPinching = true;
      this.pinchStartDist = this.dist(ev.touches[0], ev.touches[1]);
      this.pinchStartZoom = this.zoom;
      this.pinchCenter = this.center(ev.touches[0], ev.touches[1], rect);
    }
  }
  onTouchMove(ev: TouchEvent){
    if(this.isPinching && ev.touches.length===2){
      ev.preventDefault();
      const d = this.dist(ev.touches[0], ev.touches[1]);
      const factor = d / this.pinchStartDist;
      this.setZoom(this.pinchStartZoom*factor, this.pinchCenter);
    }
  }
  onTouchEnd(_: TouchEvent){
    this.isPinching = false;
  }

}