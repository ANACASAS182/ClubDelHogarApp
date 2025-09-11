import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { ReferidoDTO } from 'src/app/models/DTOs/ReferidoDTO';
import { PaginationModelDTO } from 'src/app/models/DTOs/PaginationModelDTO';

@Injectable({ providedIn: 'root' })
export class ReferidoService {
  private base = environment.apiUrl.replace(/\/+$/,'');        // quita trailing slash
  private referidoUrl   = `${this.base}/api/Referido`;
  private promocionesUrl = `${this.base}/api/Promociones`;

  constructor(private http: HttpClient) {}

  getReferidosPaginated(params: { page: number, size: number, sortBy: string, sortDir: string, searchQuery: string}) {
    return this.http.get<GenericResponseDTO<PaginationModelDTO<ReferidoDTO[]>>>(
      `${this.referidoUrl}/GetReferidosUsuarioPaginated`,
      { params: {
          page: String(params.page),
          size: String(params.size),
          sortBy: params.sortBy,
          sortDir: params.sortDir,
          searchQuery: params.searchQuery
        }
      }
    );
  }

  getReferidosSimple(usuarioID: number) {
    return this.http.get<ReferidoDTO[]>(`${this.referidoUrl}/getReferidosSimple`, {
      params: { usuarioID }
    });
  }

  getReferidosUsuario(usuarioID: number) {
    return this.http.get<GenericResponseDTO<ReferidoDTO[]>>(`${this.referidoUrl}/GetReferidosUsuario`, {
      params: { usuarioID }
    });
  }

  guardarReferido(model: ReferidoDTO) {
    return this.http.post<GenericResponseDTO<boolean>>(`${this.referidoUrl}/Save`, model);
  }

  getUltimosSeguimientos(ids: number[]) {
    return this.http.post<UltimoSeguimientoDTO[]>(`${this.referidoUrl}/GetUltimosSeguimientos`, { ids });
  }

  // === QR (usa PromocionesController) ===
  getQrUrlByReferido(referidoId: number) {
    return this.http.get<{ codigo: string; url: string }>(
      `${this.promocionesUrl}/GetQrUrlByReferido`,
      { params: { referidoId } }
    );
  }

  getQrPngByReferidoUrl(referidoId: number) {
    return `${this.promocionesUrl}/QrByReferido/${referidoId}`;
  }
}

  export type UltimoSeguimientoDTO = {
    referidoId: number;
    texto: string;
    fecha: string; // o Date si tu backend ya la manda serializada así
  };