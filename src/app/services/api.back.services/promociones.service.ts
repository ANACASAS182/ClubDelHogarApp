import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RespuestaEstatusMensaje, RespuestaEstatusPromocion } from 'src/app/models/DTOs/GenericResponseDTO';
import { Promocion } from 'src/app/models/Promocion';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';

@Injectable({ providedIn: 'root' })
export class PromocionesService {
  private readonly apiPromos = `${environment.apiUrl}api/Promociones`;
  private readonly apiEmpresa = `${environment.apiUrl}api/Empresa`;

  constructor(private http: HttpClient) {}

  // Helper para validar IDs numéricos
  private validId(v: unknown): v is number {
    const n = Number(v);
    return Number.isFinite(n) && n > 0;
  }

  // ===== EXISTENTES =====
  GenerarCodigoPromocion(solicitud: SolicitudCodigoQrRequest): Observable<SolicitudCodigoQrResponse> {
    return this.http.post<SolicitudCodigoQrResponse>(`${this.apiPromos}/GenerarCodigoPromocion`, solicitud);
  }

  GetResumenEmbajador(UsuarioID: number): Observable<ResumenEmbajadorDTO> {
    const params = new HttpParams().set('UsuarioID', String(UsuarioID));
    return this.http.get<ResumenEmbajadorDTO>(`${this.apiPromos}/GetResumenEmbajador`, { params });
  }

  GetPromociones(UsuarioID: number): Observable<Promocion[]> {
    const params = new HttpParams().set('UsuarioID', String(UsuarioID));
    return this.http.get<Promocion[]>(`${this.apiPromos}/GetPromociones`, { params });
  }

  GetPromocionesSocio(UsuarioID: number): Observable<Promocion[]> {
    const params = new HttpParams().set('UsuarioID', String(UsuarioID));
    return this.http.get<Promocion[]>(`${this.apiPromos}/GetPromocionesSocio`, { params });
  }

  // ⛑️ Blindado para no mandar ?EmpresaID=NaN
  GetPromocionesEmpresa(EmpresaID: unknown): Observable<Promocion[]> {
    if (!this.validId(EmpresaID)) {
      console.warn('[PromocionesService] EmpresaID inválido:', EmpresaID);
      return of([]); // evita llamada con NaN
    }
    const params = new HttpParams().set('EmpresaID', String(EmpresaID));
    return this.http.get<Promocion[]>(`${this.apiPromos}/GetPromocionesEmpresa`, { params });
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
  getPromocionesVigentes(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiEmpresa}/GetVigentes`);
  }

  GetPromocionesVigentesByEmpresa(empresaId: unknown): Observable<Promocion[]> {
    if (!this.validId(empresaId)) {
      console.warn('[PromocionesService] empresaId inválido (vigentes):', empresaId);
      return of([]);
    }
    const params = new HttpParams().set('empresaId', String(empresaId));
    return this.http.get<Promocion[]>(`${this.apiPromos}/GetVigentesByEmpresa`, { params });
  }

  GetPromosNetwork(): Observable<GenericResponseDTO<any[]>> {
    return this.http.get<GenericResponseDTO<any[]>>(
      `${environment.apiUrl}api/cdh/productos/promos-network`
    );
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
