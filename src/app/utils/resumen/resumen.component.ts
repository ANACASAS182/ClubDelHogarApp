import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonCard, IonItem, IonCardContent, IonItemDivider, IonGrid, IonRow, IonCol, IonIcon, IonButton } from "@ionic/angular/standalone";
import { PromocionesService, ResumenEmbajadorDTO } from 'src/app/services/api.back.services/promociones.service';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { UtilitiesService } from 'src/app/utilities.service';
import { forkJoin } from 'rxjs';

type InvitadoAny = {
  fechaInvitacion?: string | Date;
  fechaInvitacionTexto?: string;
  nombre?: string;
  email?: string;
  correoElectronico?: string;
  estatus?: 'Aceptado' | 'Pendiente' | string;
  aceptado?: boolean | number;
  activo?: boolean | number;
};

type InvitadoResumen = {
  fechaInvitacion: string | Date;
  fechaInvitacionTexto?: string;
  nombre: string;
  estatus: 'Pendiente' | 'Aceptado' | string;
  email?: string;
  correoElectronico?: string;
};

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  standalone: true,
  imports: [IonButton, IonCard, CommonModule, IonCardContent, IonItemDivider, IonGrid, IonRow, IonCol, IonItem, IonIcon],
  styleUrls: ['./resumen.component.scss'],
})
export class ResumenComponent implements OnInit {

  @Input() MostrarIngresos: boolean = false;
  @Input() MostrarInvitados: boolean = false;

  cargaCompletada = false;

  constructor(
    private _promocionesService: PromocionesService,
    private _usuarioService: UsuarioService,
    private utilities: UtilitiesService
  ) { }

  resumen?: ResumenEmbajadorDTO;
  fechaTexto = "...";

  ingresosDirectosTexto = "...";
  ingresosIndirectosTexto = "...";
  ingresosAcumuladosTexto = "...";

  CuantosDeCuantos = "0/2";
  pendientesVacios = false;

  aceptadosDetalle: InvitadoResumen[] = [];
  showPendientes = false;
  showAceptados  = false;

  toggle(seccion: 'pend'|'acept') {
  if (seccion === 'pend') this.showPendientes = !this.showPendientes;
  else this.showAceptados = !this.showAceptados;
}
  
ngOnInit() {
  this._usuarioService.getUsuario().subscribe({
    next: (u) => {
      const userId = u.data.id;

      forkJoin({
        ingresos: this._promocionesService.GetResumenEmbajador(userId),
        inv:      this._usuarioService.getInvitacionesResumen(userId)
      }).subscribe({
        next: ({ ingresos, inv }) => {
          // Header X/2 del back
          this.CuantosDeCuantos = `${inv.aceptados ?? 0}/2`;

          // PENDIENTES → adapta al tipo de Promociones (fechaInvitacion: Date)
          const pendientesMap = (inv.embajadoresInvitados ?? []).map((i: any) => {
            const d = i.fechaInvitacion ? new Date(i.fechaInvitacion) : new Date();
            return {
              // shape compatible con ResumenEmbajadorInvitacionDTO
              fechaInvitacion: d, // <-- Date, no string
              fechaInvitacionTexto: this.utilities.formatoFechaEspanol(d.toString()),
              nombre: i.nombre || i.email || i.correoElectronico || '',
              estatus: 'Pendiente'
            } as any; // si tienes el tipo ResumenEmbajadorInvitacionDTO, cámbialo aquí
          });

          // inyecta los pendientes mapeados en el DTO de ingresos
          this.resumen = { ...(ingresos as any), embajadoresInvitados: pendientesMap } as ResumenEmbajadorDTO;


          // ACEPTADOS → formateo
          this.aceptadosDetalle = (inv.embajadoresAceptados ?? []).map(i => {
            const f = i.fechaInvitacion ? new Date(i.fechaInvitacion) : undefined;
            return {
              ...i,
              fechaInvitacionTexto: f ? this.utilities.formatoFechaEspanol(f.toString()) : '',
              estatus: 'Aceptado'
            };
          });

          // $$$ como ya lo tenías
          this.ingresosDirectosTexto   = this.utilities.formatCurrency(ingresos.ingresosDirectos ?? 0);
          this.ingresosIndirectosTexto = this.utilities.formatCurrency(ingresos.ingresosIndirectos ?? 0);
          this.ingresosAcumuladosTexto = this.utilities.formatCurrency((ingresos.ingresosDirectos ?? 0) + (ingresos.ingresosIndirectos ?? 0));
          this.fechaTexto = ingresos.proximaFechaPago
            ? this.utilities.formatoFechaEspanol(ingresos.proximaFechaPago.toString())
            : '...';

          this.cargaCompletada = true;
          this.animateIngreso();
        },
        error: () => this.cargaCompletada = true
      });
    }
  });
}


  showJump = false;
  animateIngreso() {
    this.showJump = true;
    setTimeout(() => {
      this.showJump = false;
      setTimeout(() => this.animateIngreso(), 3000);
    }, 500);
  }

  // Útil para performance si la lista crece
  trackInvitado = (_: number, e: any) => e?.id ?? `${e?.nombre}-${e?.fechaInvitacionTexto}`;
}