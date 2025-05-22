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

  GetPromociones(UsuarioID:number) : Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiUrl}/GetPromociones?UsuarioID=${UsuarioID}`);
  }


  GetPromocionesEmpresa(UsuarioID: number): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiUrl}/GetPromocionesEmpresa?UsuarioID=${UsuarioID}`);
  }

  ConsultarEstatusDelCodigoQr(request: ValidarPromocionQrRequest): Observable<RespuestaEstatusPromocion> {
    return this.http.post<RespuestaEstatusPromocion>(`${this.apiUrl}/ConsultarEstatusDelCodigoQr`, request);
  }

  PostHacerPromocionValida(request: ValidarPromocionQrRequest): Observable<RespuestaEstatusMensaje> {
    return this.http.post<RespuestaEstatusMensaje>(`${this.apiUrl}/PostHacerPromocionValida`, request);
  }



  CrearNuevaPromocion(request: CrearPromocionRequest): Observable<RespuestaEstatusPromocion> {
    return this.http.post<RespuestaEstatusPromocion>(`${this.apiUrl}/CrearNuevaPromocion`, request);
  }




}


export interface CrearPromocionRequest {
  usuarioID: number;

  nombre: string;
  descripcion: string;
  VigenciaISO: string;

  comisionNivel1: number;
  comisionNivel2: number;
  comisionNivel3: number;
  comisionNivel4: number;
  comisionNivelMaster: number;

}

export interface SolicitudCodigoQrRequest {

  ProductoID: number;
  embajadorID: number;

  nombres: string;
  InformacionContacto: string;

}

export interface SolicitudCodigoQrResponse {

  qr64: string;

}

export interface ValidarPromocionQrRequest {

  UsuarioID: number;
  codigoPromocion: string;

}

}
