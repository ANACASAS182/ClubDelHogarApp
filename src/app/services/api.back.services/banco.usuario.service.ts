import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { BancoUsuario } from 'src/app/models/BancoUsuario';

@Injectable({ providedIn: 'root' })
export class BancoUsuarioService {
  private apiUrl = environment.apiUrl + 'api/BancoUsuario';

  constructor(private http: HttpClient) {}

  private isValidId(v: unknown): v is number {
    const n = Number(v);
    return Number.isFinite(n) && n > 0;
  }

  getBancoByID(id: number): Observable<GenericResponseDTO<BancoUsuario>> {
    if (!this.isValidId(id)) {
      // evita mandar ?id=NaN
      console.warn('[BancoUsuarioService] id inválido en getBancoByID:', id);
      // devuelve una respuesta “vacía” para no romper llamadas
      return of({ success: false, message: 'id inválido' } as any);
    }
    const params = new HttpParams().set('id', String(id));
    return this.http.get<GenericResponseDTO<BancoUsuario>>(`${this.apiUrl}/GetBancoByID`, { params });
  }

  getBancosUsuario(): Observable<GenericResponseDTO<BancoUsuario[]>> {
    return this.http.get<GenericResponseDTO<BancoUsuario[]>>(`${this.apiUrl}/GetBancosUsuario`);
  }

  save(model: BancoUsuario): Observable<GenericResponseDTO<boolean>> {
    // opcional: evitar mandar id NaN al editar
    if (model?.id != null && !this.isValidId(model.id)) {
      console.warn('[BancoUsuarioService] model.id inválido en save:', model.id);
      return of({ success: false, message: 'model.id inválido' } as any);
    }
    return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/Save`, model);
  }

  delete(id: number): Observable<GenericResponseDTO<boolean>> {
    if (!this.isValidId(id)) {
      console.warn('[BancoUsuarioService] id inválido en delete:', id);
      return of({ success: false, message: 'id inválido' } as any);
    }
    const params = new HttpParams().set('bancoID', String(id));
    return this.http.get<GenericResponseDTO<boolean>>(`${this.apiUrl}/SoftDelete`, { params });
  }
}
