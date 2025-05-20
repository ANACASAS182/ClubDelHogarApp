import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UsuarioCelula } from 'src/app/models/DTOs/CelulaDTO';
import { UsuarioService } from '../../services/api.back.services/usuario.service';
import { InvitarComponent } from 'src/app/modals/invitar/invitar.component';
import { ModalController } from '@ionic/angular';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Usuario } from 'src/app/models/Usuario';

@Component({
  selector: 'app-celula',
  templateUrl: './celula.page.html',
  styleUrls: ['./celula.page.scss'],
  standalone: false
})
export class CelulaPage implements OnInit {

  constructor(private _usuarioService: UsuarioService, private modalCtrl: ModalController) { }

  celula?: UsuarioCelula;

  UsuarioID: number = 0;

  cargandoCelula: boolean = true;

  ngOnInit(): void {

    this.cargandoCelula = true;

    this._usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        console.log(response.data);
        this.UsuarioID = response.data.id;

        // Usamos setTimeout para introducir un retraso de 1 segundo (1000 ms)
        setTimeout(() => {
          this._usuarioService.getCelulaLocal(1).subscribe({
            next: (data) => {
              console.log("celula");
              console.log(data);
              this.celula = data;
              this.cargandoCelula = false;
            },
            error: (err) => { },
            complete: () => { }
          });
        }, 2000);  // Retraso de 1 segundo
      }
    });


  }


  async onFabClick() {
    let formDirty = false;
    const modal = await this.modalCtrl.create({
      component: InvitarComponent,
      cssClass: 'modal-redondeado',
      componentProps: {
        EmbajadorReferenteID: this.UsuarioID,
        setFormDirtyStatus: (dirty: boolean) => formDirty = dirty
      },
      canDismiss: async () => {
        if (!formDirty) return true;

        const shouldClose = true;
        return shouldClose;
      }
    });
    await modal.present();
  }


  /* CHAT GPT CELULA FIJA */

  @ViewChild('orgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const boxWidth = 250; // Más ancho
    const boxHeight = 60;

    const positions: { [key: string]: [number, number] } = {
      'Ana Laura Casas': [canvas.width / 2, 50],
      'Julio Laborin': [canvas.width / 2 - 180, 150],
      'Ileana Leon': [canvas.width / 2 + 180, 150],
      'Yonatan Castro': [canvas.width / 2 - 180, 250],
      'Jesús Gómez': [canvas.width / 2 - 180, 350],
      'Josue Angeles': [canvas.width / 2 - 180, 450],
    };

    const colors = ['#dcdcdc', '#c0c0c0', '#a9a9a9', '#888'];

    const drawNode = (
      name: string,
      info: string,
      x: number,
      y: number,
      color: string
    ) => {
      ctx.fillStyle = color;
      ctx.fillRect(x - boxWidth / 2, y, boxWidth, boxHeight);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(x - boxWidth / 2, y, boxWidth, boxHeight);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px Arial'; // Nombre en negrita
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(name, x, y + 5);
      ctx.font = '14px Arial'; // Info en regular
      ctx.fillText(info, x, y + 25);
    };

    const drawCurve = (fromX: number, fromY: number, toX: number, toY: number) => {
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      const cpY = (fromY + toY) / 2;
      ctx.bezierCurveTo(fromX, cpY, toX, cpY, toX, toY);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    // Dibujar nodos
    drawNode('Ana Laura Casas', 'ana.casas@sistemasperseo.com', ...positions['Ana Laura Casas'], colors[0]);
    drawNode('Julio Laborin', '6561324687', ...positions['Julio Laborin'], colors[1]);
    drawNode('Ileana Leon', 'ileana@gmail.com', ...positions['Ileana Leon'], colors[1]);
    drawNode('Yonatan Castro', 'yonatan@outlook.com', ...positions['Yonatan Castro'], colors[2]);
    drawNode('Jesús Gómez', 'jesus@embassyen.com', ...positions['Jesús Gómez'], colors[3]);
    drawNode('Josue Angeles', '55 1354 5645', ...positions['Josue Angeles'], colors[3]);

    // Dibujar conexiones
    drawCurve(
      positions['Ana Laura Casas'][0],
      positions['Ana Laura Casas'][1] + boxHeight,
      positions['Julio Laborin'][0],
      positions['Julio Laborin'][1]
    );
    drawCurve(
      positions['Ana Laura Casas'][0],
      positions['Ana Laura Casas'][1] + boxHeight,
      positions['Ileana Leon'][0],
      positions['Ileana Leon'][1]
    );
    drawCurve(
      positions['Julio Laborin'][0],
      positions['Julio Laborin'][1] + boxHeight,
      positions['Yonatan Castro'][0],
      positions['Yonatan Castro'][1]
    );
    drawCurve(
      positions['Yonatan Castro'][0],
      positions['Yonatan Castro'][1] + boxHeight,
      positions['Jesús Gómez'][0],
      positions['Jesús Gómez'][1]
    );
    drawCurve(
      positions['Jesús Gómez'][0],
      positions['Jesús Gómez'][1] + boxHeight,
      positions['Josue Angeles'][0],
      positions['Josue Angeles'][1]
    );
  }



}


