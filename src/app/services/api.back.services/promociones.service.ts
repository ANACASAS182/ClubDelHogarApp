import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RespuestaEstatusMensaje, RespuestaEstatusPromocion } from 'src/app/models/DTOs/GenericResponseDTO';
import { Promocion } from 'src/app/models/Promocion';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class PromocionesService {
  // Asegúrate que environment.apiUrl termine con "/" o ajusta los templates abajo
  private readonly apiPromos = `${environment.apiUrl}api/Promociones`;
  private readonly apiEmpresa = `${environment.apiUrl}api/Empresa`;

  constructor(private http: HttpClient) {}

  // ===== EXISTENTES =====
  GenerarCodigoPromocion(solicitud: SolicitudCodigoQrRequest): Observable<SolicitudCodigoQrResponse> {
    return this.http.post<SolicitudCodigoQrResponse>(`${this.apiPromos}/GenerarCodigoPromocion`, solicitud);
  }

  GetResumenEmbajador(UsuarioID: number): Observable<ResumenEmbajadorDTO> {
    return this.http.get<ResumenEmbajadorDTO>(`${this.apiPromos}/GetResumenEmbajador`, {
      params: { UsuarioID }
    });
  }

  GetPromociones(UsuarioID: number): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiPromos}/GetPromociones`, {
      params: { UsuarioID }
    });
  }

  GetPromocionesSocio(UsuarioID: number): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiPromos}/GetPromocionesSocio`, {
      params: { UsuarioID }
    });
  }

  GetPromocionesEmpresa(EmpresaID: number): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiPromos}/GetPromocionesEmpresa`, {
      params: { EmpresaID }
    });
  }

  ConsultarEstatusDelCodigoQr(request: ValidarPromocionQrRequest): Observable<RespuestaEstatusPromocion> {
    return this.http.post<RespuestaEstatusPromocion>(`${this.apiPromos}/ConsultarEstatusDelCodigoQr`, request);
  }

  PostHacerPromocionValida(request: ValidarPromocionQrRequest): Observable<RespuestaEstatusMensaje> {
    return this.http.post<RespuestaEstatusMensaje>(`${this.apiPromos}/PostHacerPromocionValida`, request);
  }

  CrearNuevaPromocion(request: CrearPromocionRequest): Observable<RespuestaEstatusPromocion> {
    return this.http.post<RespuestaEstatusPromocion>(`${this.apiPromos}/CrearNuevaPromocion`, request);
  }

  // ===== NUEVOS =====
  /** Server-side filter: empresa del TOKEN (endpoint en EmpresaController) */
  getPromocionesVigentes(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiEmpresa}/GetVigentes`);
  }

  /** Server-side filter: empresa explícita (endpoint en PromocionesController) */
  GetPromocionesVigentesByEmpresa(empresaId: number): Observable<Promocion[]> {
    const params = new HttpParams().set('empresaId', String(empresaId));
    return this.http.get<Promocion[]>(`${this.apiPromos}/GetVigentesByEmpresa`, { params });
  }
}

// ====== Interfaces ======
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

export interface ResumenEmbajadorDTO {
  ingresosDirectos: number;
  ingresosIndirectos: number;
  proximaFechaPago: Date;
  embajadoresInvitados: ResumenEmbajadorInvitacionDTO[];
}

export interface ResumenEmbajadorInvitacionDTO {
  nombre: string;
  fechaInvitacion: Date;
  fechaInvitacionTexto: string;
  estatus: string;
}

export interface SolicitudCodigoQrRequest {
  ProductoID: number;
  embajadorID: number;
  nombres: string;
  InformacionContacto: string;
}

export interface SolicitudCodigoQrResponse {
  qr64: string;
  whatsappEnviado?: boolean;
  whatsappSid?: string;
}

export interface ValidarPromocionQrRequest {
  UsuarioID: number;
  codigoPromocion: string;
}