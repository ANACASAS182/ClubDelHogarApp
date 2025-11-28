import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { Usuario } from 'src/app/models/Usuario';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';

import {
  ApiBackServicesCDH,
  CuponesResumenEmbajadorDTO,
  CuponResumenDTO,
} from 'src/app/services/api.back.services.cdh/registro.service';

import { PrefsStorage } from 'src/app/core/utils/prefs.storage';
import { TokenService } from 'src/app/services/token.service';
import { ModalQRComponent } from 'src/app/modals/modal-qr/modal-qr.component';

@Component({
  selector: 'app-vende-network',
  templateUrl: './vende-network.page.html',
  styleUrls: ['./vende-network.page.scss'],
  standalone: false,
})
export class VendeNetworkPage implements OnInit {
  // Usuario / sesión
  UsuarioID = 0;
  nombreUsuario = '';
  correoUsuario = '';
  esInvitado = true;
  esSocio = false; // si lo sigues usando para el footer

  // Resumen cupones
  cargando = true;
  errorMsg = '';
  resumen: CuponesResumenEmbajadorDTO | null = null;

  // Segment para tabs (por canjear / canjeadas)
  segmento: 'pendientes' | 'canjeadas' = 'pendientes';

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private cdhService: ApiBackServicesCDH,
    private modalCtrl: ModalController,
    private tokenService: TokenService,
    private prefs: PrefsStorage
  ) {}

  async ngOnInit() {
    // 1) Intentar leer usuario rápido desde localStorage
    const cacheRaw = localStorage.getItem('usuario-actual');
    if (cacheRaw) {
      try {
        const u = JSON.parse(cacheRaw) as Usuario;
        this.aplicarUsuario(u, false);
      } catch {
        // noop
      }
    }

    // 2) Refrescar usuario desde backend
    this.usuarioService.getUsuario(true).subscribe({
      next: (resp: GenericResponseDTO<Usuario>) => {
        if (!resp?.data) {
          this.marcarInvitado();
          return;
        }
        this.aplicarUsuario(resp.data, true);
      },
      error: () => {
        if (!this.UsuarioID) {
          this.marcarInvitado();
        }
      },
    });
  }

  private aplicarUsuario(user: Usuario, cargarCupones: boolean) {
    this.UsuarioID = (user as any).id ?? (user as any).ID ?? 0;
    this.nombreUsuario = `${user.nombres ?? ''} ${user.apellidos ?? ''}`.trim();
    this.correoUsuario = (user.email ?? '').trim();

    const rolId = Number(
      (user as any)?.rolesID ??
      (user as any)?.RolesID ??
      (user as any)?.rolID ??
      (user as any)?.rolId ??
      (user as any)?.rol?.id ??
      (user as any)?.rol ??
      0
    );

    this.esSocio = rolId === 2;
    this.esInvitado = !this.UsuarioID;

    localStorage.setItem('usuario-actual', JSON.stringify(user));

    if (cargarCupones && this.UsuarioID) {
      this.cargarCupones();
    }
  }

  private marcarInvitado() {
    this.UsuarioID = 0;
    this.nombreUsuario = '';
    this.correoUsuario = '';
    this.esInvitado = true;
    this.cargando = false;
    this.resumen = {
      totalGenerados: 0,
      totalCanjeados: 0,
      generados: [],
      canjeados: [],
    };
  }

  private cargarCupones() {
    if (!this.UsuarioID) {
      this.marcarInvitado();
      return;
    }

    this.cargando = true;
    this.errorMsg = '';

    this.cdhService.getResumenCuponesEmbajador(this.UsuarioID).subscribe({
      next: (resp) => {
        if (!resp?.success || !resp.data) {
          this.resumen = {
            totalGenerados: 0,
            totalCanjeados: 0,
            generados: [],
            canjeados: [],
          };
          this.errorMsg = resp?.message || 'No se pudo obtener la información.';
        } else {
          this.resumen = resp.data;
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('[Vende] error resumen cupones', err);
        this.errorMsg = 'Error al obtener las promociones.';
        this.cargando = false;
        this.resumen = {
          totalGenerados: 0,
          totalCanjeados: 0,
          generados: [],
          canjeados: [],
        };
      },
    });
  }

  // ========= Getters para la vista =========

  get inicialesUsuario(): string {
    const n = (this.nombreUsuario || this.correoUsuario || '').trim();
    if (!n) return 'U';
    const parts = n.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }

  get cuponesPendientes(): CuponResumenDTO[] {
    return this.resumen?.generados ?? [];
  }

  get cuponesCanjeados(): CuponResumenDTO[] {
    return this.resumen?.canjeados ?? [];
  }

  // ========= Navegación / sesión =========

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

    this.marcarInvitado();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  irACompra() {
    this.router.navigate(['/dashboard/network']);
  }

  irAVende() {
    this.router.navigate(['/vende']);
  }

  // ========= QR =========

  async abrirScanQr() {
    if (!this.UsuarioID) {
      this.router.navigate(['/registro']);
      return;
    }

    const modal = await this.modalCtrl.create({
      component: ModalQRComponent,
      cssClass: 'modal-fullscreen',
      componentProps: {
        codigoParametro: '',
      },
    });

    await modal.present();
    await modal.onDidDismiss();
  }
}