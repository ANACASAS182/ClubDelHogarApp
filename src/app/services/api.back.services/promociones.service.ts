import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericResponseDTO, RespuestaEstatusMensaje } from 'src/app/models/DTOs/GenericResponseDTO';
import { Promocion } from 'src/app/models/Promocion';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PromocionesService {
  private apiUrl = environment.apiUrl + "api/Promociones"; 

  constructor(private http: HttpClient) {}

  GenerarCodigoPromocion(solicitud:SolicitudCodigoQrRequest) : Observable<SolicitudCodigoQrResponse> {
    return this.http.post<SolicitudCodigoQrResponse>(`${this.apiUrl}/GenerarCodigoPromocion`, solicitud);
  }

  GetPromociones() : Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiUrl}/GetPromociones`);
  }

 
  
}

export interface SolicitudCodigoQrRequest {

  ProductoID:number;
  embajadorID:number;

  nombres:string;
  celular:string;

}

export interface SolicitudCodigoQrResponse {

  qr64:string;

}
