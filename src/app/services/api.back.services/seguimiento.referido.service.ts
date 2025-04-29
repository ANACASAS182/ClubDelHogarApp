import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { FuenteOrigenDTO } from 'src/app/models/DTOs/FuenteOrigenDTO';
import { SeguimientoReferido } from 'src/app/models/SeguimientoReferido';

@Injectable({
  providedIn: 'root',
})

export class SeguimientoReferidoService {
  private apiUrl = environment.apiUrl + "api/SeguimientoReferido"; 

  constructor(private http: HttpClient) {}

  getSeguimientosReferido(referidoID: number) : Observable<GenericResponseDTO<SeguimientoReferido[]>> {
    let params = new HttpParams().set("referidoID",referidoID);
    return this.http.get<GenericResponseDTO<SeguimientoReferido[]>>(`${this.apiUrl}/GetSeguimientoReferido`, {params});
  }

}