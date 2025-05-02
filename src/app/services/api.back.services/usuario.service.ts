import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginUsuarioDTO } from 'src/app/models/DTOs/LoginUsuarioDTO';
import { UsuarioDTO } from 'src/app/models/DTOs/UsuarioDTO';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { PasswordRecoveryDTO } from 'src/app/models/DTOs/PasswordRecoveryDTO';
import { PasswordResetDTO } from 'src/app/models/DTOs/PasswordResetDTO';
import { Usuario } from 'src/app/models/Usuario';
import { UsuarioCelula } from 'src/app/models/DTOs/CelulaDTO';

@Injectable({
  providedIn: 'root',
})

export class UsuarioService {
  private apiUrl = environment.apiUrl + "api/Usuario"; 

  constructor(private http: HttpClient) {}

  login(user: LoginUsuarioDTO, skipErrorHandler = false): Observable<GenericResponseDTO<string>> {
    let url = this.apiUrl + "/Login";

    let headers = new HttpHeaders();

    if (skipErrorHandler) {
      headers = headers.set('skipErrorHandler', 'true');
    }
    const options = { headers };
    
    return this.http.post<GenericResponseDTO<string>>(url, user, options);
  }

  register(user: UsuarioDTO, skipErrorHandler = false) : Observable<GenericResponseDTO<boolean>> {
    let headers = new HttpHeaders();

    if (skipErrorHandler) {
      headers = headers.set('skipErrorHandler', 'true');
    }
    const options = { headers };

    return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/RegistroUsuario`, user, options);
  }

  passwordRecovery(model: PasswordRecoveryDTO, skipErrorHandler = false) : Observable<GenericResponseDTO<boolean>> {
    let headers = new HttpHeaders();

    if (skipErrorHandler) {
      headers = headers.set('skipErrorHandler', 'true');
    }
    const options = { headers };
    return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/PasswordRecovery`, model, options);
  }

  passwordReset(model: PasswordResetDTO, skipErrorHandler = false) : Observable<GenericResponseDTO<boolean>> {
    let headers = new HttpHeaders();

    if (skipErrorHandler) {
      headers = headers.set('skipErrorHandler', 'true');
    }
    const options = { headers };
    return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/PasswordReset`, model, options);
  }

  getUsuario(skipErrorHandler = false) : Observable<GenericResponseDTO<Usuario>> {
    let headers = new HttpHeaders();

    if (skipErrorHandler) {
      headers = headers.set('skipErrorHandler', 'true');
    }
    const options = { headers };
    return this.http.get<GenericResponseDTO<Usuario>>(`${this.apiUrl}/GetUsuarioLogeado`, options);
  }
  
  getCelulaLocal(userID:number): Observable<UsuarioCelula> {
    return this.http.get<UsuarioCelula>(`${this.apiUrl}/GetCelulaLocal?UsuarioID=${userID}`);
  }

  updateUsuario(user: UsuarioDTO, skipErrorHandler = false): Observable<GenericResponseDTO<boolean>> {
    let headers = new HttpHeaders();

    if (skipErrorHandler) {
      headers = headers.set('skipErrorHandler', 'true');
    }
    const options = { headers };
    return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/ActualizarUsuario`, user, options);
  }

}