import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { ReferidoDTO } from 'src/app/models/DTOs/ReferidoDTO';
import { PaginationModelDTO } from 'src/app/models/DTOs/PaginationModelDTO';

@Injectable({
  providedIn: 'root',
})

export class ReferidoService {
  private apiUrl = environment.apiUrl + "api/Referido"; 

  constructor(private http: HttpClient) {}

  getReferidosPaginated(params: { page: number, size: number, sortBy: string, sortDir: string, searchQuery: string}) : Observable<GenericResponseDTO<PaginationModelDTO<ReferidoDTO[]>>>{
    
    let parameters = {
      page: params.page.toString(),
      size: params.size.toString(),
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      searchQuery: params.searchQuery
    }
    return this.http.get<GenericResponseDTO<PaginationModelDTO<ReferidoDTO[]>>>(`${this.apiUrl}/GetReferidosUsuarioPaginated`, {params : parameters});
  }

  getReferidosSimple(usuarioID : number): Observable<ReferidoDTO[]>{
    let params = new HttpParams().set("usuarioID", usuarioID);
    return this.http.get<ReferidoDTO[]>(`${this.apiUrl}/getReferidosSimple`,{params});
  }

  getReferidosUsuario(usuarioID : number) : Observable<GenericResponseDTO<ReferidoDTO[]>> {
    let params = new HttpParams().set("usuarioID", usuarioID);
    return this.http.get<GenericResponseDTO<ReferidoDTO[]>>(`${this.apiUrl}/GetReferidosUsuario`,{params});
  }

  guardarReferido(model : ReferidoDTO) : Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/Save`,model);
  }

  getUltimosSeguimientos(ids: number[]): Observable<UltimoSeguimientoDTO[]> {
  const url = `${this.apiUrl}/GetUltimosSeguimientos`; // ajusta el nombre si tu ruta es distinta
  return this.http.post<UltimoSeguimientoDTO[]>(url, { ids });
}

}
export type UltimoSeguimientoDTO = {
  referidoId: number;
  texto: string;
  fecha: string; // o Date si tu backend ya la manda serializada así
};