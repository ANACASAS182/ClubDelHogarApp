import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginUsuarioDTO } from 'src/app/models/DTOs/LoginUsuarioDTO';
import { UsuarioDTO, UsuarioRegistrarBasicoDTO } from 'src/app/models/DTOs/UsuarioDTO';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { PasswordRecoveryDTO } from 'src/app/models/DTOs/PasswordRecoveryDTO';
import { PasswordResetDTO } from 'src/app/models/DTOs/PasswordResetDTO';
import { Usuario } from 'src/app/models/Usuario';
import { UsuarioCelula } from 'src/app/models/DTOs/CelulaDTO';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrlUsuario = `${environment.apiUrl}api/Usuario`;
  private apiUrlEmbajadores = `${environment.apiUrl}api/Embajadores`;

  constructor(private http: HttpClient) {}

  private makeHeaders(skipErrorHandler = false) {
    let headers = new HttpHeaders();
    if (skipErrorHandler) headers = headers.set('skipErrorHandler', 'true');
    return { headers };
  }

  login(user: LoginUsuarioDTO, skipErrorHandler = false): Observable<GenericResponseDTO<string>> {
    return this.http.post<GenericResponseDTO<string>>(
      `${this.apiUrlUsuario}/Login`,
      user,
      this.makeHeaders(skipErrorHandler)
    );
  }

   getInvitacionesResumen(embajadorId: number, skipErrorHandler = false) {
      return this.http.get<ResumenInvitadosDTO>(
        `${this.apiUrlEmbajadores}/InvitadosResumen`,
        {
          params: new HttpParams().set('embajadorId', String(embajadorId)),
          ...this.makeHeaders(skipErrorHandler)
        }
      );
    }

  

  // ✅ FIX: usar apiUrlUsuario y devolver GenericResponseDTO<boolean>
  updateUsuario(user: UsuarioDTO, skipErrorHandler = false): Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(
      `${this.apiUrlUsuario}/Save`,
      user,
      this.makeHeaders(skipErrorHandler)
    );
  }

  postOnboardingA(user: UsuarioDTO): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrlUsuario}/postOnboardingA`, user);
  }

  postOnboardingB(user: UsuarioDTO): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrlUsuario}/postOnboardingB`, user);
  }

  registerCodigoInvitacion(
    user: UsuarioRegistrarBasicoDTO,
    skipErrorHandler = false
  ): Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(
      `${this.apiUrlUsuario}/RegistroUsuarioCodigoInvitacion`,
      user,
      this.makeHeaders(skipErrorHandler)
    );
  }

  passwordRecovery(model: PasswordRecoveryDTO, skipErrorHandler = false): Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(
      `${this.apiUrlUsuario}/PasswordRecovery`,
      model,
      this.makeHeaders(skipErrorHandler)
    );
  }

  passwordReset(model: PasswordResetDTO, skipErrorHandler = false): Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(
      `${this.apiUrlUsuario}/PasswordReset`,
      model,
      this.makeHeaders(skipErrorHandler)
    );
  }

  getUsuario(skipErrorHandler = false): Observable<GenericResponseDTO<Usuario>> {
    return this.http.get<GenericResponseDTO<Usuario>>(
      `${this.apiUrlUsuario}/GetUsuarioLogeado`,
      this.makeHeaders(skipErrorHandler)
    );
  }

  // ✅ FIX: HttpParams como string
  getCelulaLocal(userID: number): Observable<UsuarioCelula> {
    return this.http.get<UsuarioCelula>(`${this.apiUrlUsuario}/GetCelulaLocal`, {
      params: new HttpParams().set('UsuarioID', String(userID))
    });
  }

  // ✅ Usa base URL correcta + HttpParams como string
  getMiCelula(yoId: number, limit = 4): Observable<MiCelulaDisplay> {
    return this.http.get<MiCelulaDisplay>(`${this.apiUrlEmbajadores}/miCelula`, {
      params: new HttpParams()
        .set('yoId', String(yoId))
        .set('limit', String(limit))
    });
  }

}


// ------------ Invitado resumen
// Tipos
export interface InvitadoResumen {
  fechaInvitacion: string;          // ISO
  fechaInvitacionTexto?: string;    // lo llenamos en el front
  nombre: string;
  estatus: 'Pendiente' | 'Aceptado' | string;
}
export interface ResumenInvitadosDTO {
  embajadoresInvitados: InvitadoResumen[];  // PENDIENTES
  aceptados: number;                        // X/2
  embajadoresAceptados: InvitadoResumen[];  // ACEPTADOS (nuevo)
}


// Tipos del endpoint
export interface NodoCelulaDTO {
  usuarioId: number;
  nombre: string;
  contacto: string;
}
export interface MiCelulaDisplay {
  padre?: NodoCelulaDTO | null;
  yo: NodoCelulaDTO;
  hijos: NodoCelulaDTO[];
}