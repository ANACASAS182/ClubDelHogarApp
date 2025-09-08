import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/api.back.services/usuario.service';
import { PromocionesService } from '../../services/api.back.services/promociones.service';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Usuario } from 'src/app/models/Usuario';
import { Promocion } from 'src/app/models/Promocion';
import { ModalController } from '@ionic/angular';
import { AgregarPromocionComponent } from 'src/app/modals/agregar-promocion/agregar-promocion.component';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: false
})
export class ProductosPage implements OnInit {
  UsuarioID = 0;
  promociones: Promocion[] = [];
  cargandoPromociones = true;

  constructor(
    private usuarioService: UsuarioService,
    private promocionesService: PromocionesService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>) => {
        this.UsuarioID = response.data.id;

        this.promocionesService.GetPromocionesSocio(this.UsuarioID).subscribe({
          next: (data) => {
            this.promociones = data || [];
            this.cargandoPromociones = false;
          },
          error: _ => this.cargandoPromociones = false
        });
      },
      error: _ => this.cargandoPromociones = false
    });
  }

  // =================== SOLO BDD, PERO ROBUSTO A VARIANTES ===================

  /** Lee TipoComision desde camelCase/PascalCase y también si viene anidado en producto.* */
  private tipoComisionDe(p: any): 0 | 1 {
    const t =
      p?.tipoComision ??
      p?.TipoComision ??
      p?.producto?.tipoComision ??
      p?.producto?.TipoComision ??
      0;
    const n = Number(t);
    return (n === 1 || t === '1') ? 1 : 0;
  }

  /** true si BDD dice 1 = Porcentaje */
  esPorcentaje(p: any): boolean {
    return this.tipoComisionDe(p) === 1;
  }

  /** Valor numérico a mostrar según BDD, con fallbacks comunes */
  getComisionValor(p: any): number {
    if (this.esPorcentaje(p)) {
      const v =
        Number(p?.comisionPorcentaje ?? p?.ComisionPorcentaje ??
               p?.producto?.comisionPorcentaje ?? p?.producto?.ComisionPorcentaje) || 0;
      return Number.isFinite(v) ? v : 0;
    } else {
      // ignora strings con '%'
      const raw =
        (p?.comisionCantidad ?? p?.ComisionCantidad ??
         p?.producto?.comisionCantidad ?? p?.producto?.ComisionCantidad);
      const cant = (typeof raw === 'string' && raw.includes('%')) ? 0 : Number(raw) || 0;
      const precio =
        Number(p?.precio ?? p?.Precio ?? p?.producto?.precio ?? p?.producto?.Precio) || 0;
      const v = cant || precio || 0;
      return Number.isFinite(v) ? v : 0;
    }
  }
  // ==========================================================================

  abrirModalPromocion(_promocion: Promocion) {}

  async abrirModalAgregarPromocion() {
    let formDirty = false;
    const modal = await this.modalCtrl.create({
      component: AgregarPromocionComponent,
      cssClass: 'modal-redondeado',
      componentProps: {
        EmbajadorReferenteID: this.UsuarioID,
        setFormDirtyStatus: (dirty: boolean) => (formDirty = dirty)
      },
      canDismiss: async () => {
        if (!formDirty) return true;
        const shouldClose = true;
        return shouldClose;
      }
    });
    await modal.present();
  }
}