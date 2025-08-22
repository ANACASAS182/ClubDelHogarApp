import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { UsuarioService, MiCelulaDisplay } from 'src/app/services/api.back.services/usuario.service';
import { InvitarComponent } from 'src/app/modals/invitar/invitar.component';
import { ModalController } from '@ionic/angular';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Usuario } from 'src/app/models/Usuario';

type RoleMini = 'padre' | 'yo' | 'hijo';

class MiniNode {
  x = 0; y = 0; w = 180; h = 60;
  nombre = ''; contacto = ''; role: RoleMini = 'hijo';
  /** segmento vertical desde el bus hasta el nodo hijo */
  rutaDesdeBus?: string;
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

  celula: MiCelulaDisplay | null = null;
  UsuarioID = 0;
  cargandoCelula = true;

  // escena mini
  miniWidth = 960;
  miniHeight = 420;

  padreNode?: MiniNode;
  yoNode?: MiniNode;
  hijosNodes: MiniNode[] = [];

  // conectores (L rectas)
  linkPadreYo = '';       // vertical padre -> yo
  busVerticalPath = '';   // vertical yo -> bus
  busHorizontalPath = ''; // horizontal bus

  // layout
  private readonly topMargin = 40;
  private readonly gapPadreYo = 32;
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

        // Trae mi célula (máx 4)
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

  private measureW(nombre: string, contacto: string, padLeft = 14, nameFontPx = 16) {
  const rightPad = 14;
  if (!this.ctx) return 180;
  this.ctx.font = `${nameFontPx}px sans-serif`;  // << antes era 16px fijo
  const w1 = this.ctx.measureText(nombre || '').width;
  this.ctx.font = '12px sans-serif';
  const w2 = this.ctx.measureText(contacto || '').width;
  return Math.max(180, Math.ceil(Math.max(w1, w2) + padLeft + rightPad));
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
    yo.w = this.measureW(yo.nombre, yo.contacto, 14, 20); // << antes no enviaba 18
    yo.h = 60;
    yo.x = Math.round(this.miniWidth / 2 - yo.w / 2);
    yo.y = this.topMargin + (this.celula?.padre ? this.gapPadreYo : 0);
    this.yoNode = yo;


    // --- PADRE (opcional) ---
    if (this.celula?.padre) {
      const p = new MiniNode();
      p.role = 'padre';
      p.nombre = this.nameOf(this.celula.padre);
      p.contacto = this.contactOf(this.celula.padre);
      p.w = this.measureW(p.nombre, p.contacto);
      p.h = 60;
      p.x = Math.round(yo.x + yo.w / 2 - p.w / 2);
      p.y = yo.y - (this.gapPadreYo + p.h);
      this.padreNode = p;

      // línea vertical centro-abajo del padre -> centro-arriba de yo
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

      const rootCx = Math.round(yo.x + yo.w / 2);            // centro de Yo
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

        // segmento vertical bus -> hijo
        const cx = Math.round(node.x + node.w / 2);
        node.rutaDesdeBus = `M ${cx} ${busY} L ${cx} ${node.y}`;
        centers.push(cx);

        this.hijosNodes.push(node);
      });

      // vertical Yo -> bus
      this.busVerticalPath = `M ${rootCx} ${yo.y + yo.h} L ${rootCx} ${busY}`;

      // horizontal del bus
      if (centers.length === 1) {
        // si solo hay un hijo: del centro de Yo al centro del hijo
        const only = centers[0];
        const left  = Math.min(rootCx, only);
        const right = Math.max(rootCx, only);
        this.busHorizontalPath = `M ${left} ${busY} L ${right} ${busY}`;
      } else {
        // varios hijos: de extremo a extremo
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
}