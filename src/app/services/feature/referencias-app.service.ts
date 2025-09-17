import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PageResult, ReferenciaItemDTO } from 'src/app/models/DTOs/referencia-app.dto';

@Injectable({ providedIn: 'root' })
export class ReferenciasAppService {
  private api = `${environment.apiUrl}/referidos`;

  constructor(private http: HttpClient) {}

  getPage(opts: {
    page: number; size: number;
    search?: string;
    empresaId?: number;
    usuarioId?: number;
    estatus?: number;
  }): Observable<PageResult<ReferenciaItemDTO>> {

    let params = new HttpParams()
      .set('page', opts.page)
      .set('size', opts.size)
      .set('sortBy', 'id')
      .set('sortDir', 'desc');

    if (opts.search)    params = params.set('searchQuery', opts.search);
    if (opts.empresaId) params = params.set('empresaID',  String(opts.empresaId));
    if (opts.usuarioId) params = params.set('usuarioID',  String(opts.usuarioId));
    if (opts.estatus != null) params = params.set('statusEnum', String(opts.estatus));

    // usa tu endpoint existente (ajusta si tu backend separa byEmpresa)
    return this.http.get<PageResult<ReferenciaItemDTO>>(`${this.api}/paginated-mobile`, { params });
  }

  getQR(codigo: string) {
    return this.http.get<{data:string}>(`${this.api}/qr/${codigo}`);
  }
}
