import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonCard, IonItem, IonCardContent, IonItemDivider, IonGrid, IonRow, IonCol } from "@ionic/angular/standalone";
import { PromocionesService, ResumenEmbajadorDTO } from 'src/app/services/api.back.services/promociones.service';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { UtilitiesService } from 'src/app/utilities.service';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  standalone: true,
  imports: [IonCard, CommonModule, IonCardContent, IonItemDivider, IonGrid, IonRow, IonCol],
  styleUrls: ['./resumen.component.scss'],
})
export class ResumenComponent implements OnInit {

  @Input() MostrarIngresos: boolean = false;
  @Input() MostrarInvitados: boolean = false;

  cargaCompletada: boolean = false;

  constructor(private _promocionesService: PromocionesService,
    private _usuarioService: UsuarioService,
    private utilities: UtilitiesService
  ) { }

  resumen?: ResumenEmbajadorDTO;
  fechaTexto: string = "...";

  ingresosDirectosTexto: string = "...";
  ingresosIndirectosTexto: string = "...";
  ingresosAcumuladosTexto: string = "...";

  CuantosDeCuantos: string = "0/2";

  ngOnInit() {
    this._usuarioService.getUsuario().subscribe({
      next: (u) => {
        this._promocionesService.GetResumenEmbajador(u.data.id).subscribe({
          next: (r) => {
            console.log(r);


            this.resumen = r;
            this.fechaTexto = this.utilities.formatoFechaEspanol(r.proximaFechaPago!.toString());
            this.ingresosDirectosTexto = this.utilities.formatCurrency(r.ingresosDirectos);
            this.ingresosIndirectosTexto = this.utilities.formatCurrency(r.ingresosIndirectos);
            let ingresosAcumulados = r.ingresosDirectos +  r.ingresosIndirectos;
            this.ingresosAcumuladosTexto = this.utilities.formatCurrency(ingresosAcumulados);

            this.cargaCompletada = true;

            let EmbajadoresEsteMes: number = 0;
            r.embajadoresInvitados.forEach(i => {
              i.fechaInvitacionTexto = this.utilities.formatoFechaEspanol(i.fechaInvitacion.toString());
              if (i.estatus == "Aceptado") {
                EmbajadoresEsteMes++;
              }
            });
            this.CuantosDeCuantos = EmbajadoresEsteMes + "/2";

            this.animateIngreso();
          }
        });
      }
    });

  }


  showJump = false;



  animateIngreso() {
    this.showJump = true;
    setTimeout(() => {
      this.showJump = false;
      setTimeout(() => {
        this.animateIngreso();
      }, 3000);
    }, 500); // duración de la animación

  }

}
