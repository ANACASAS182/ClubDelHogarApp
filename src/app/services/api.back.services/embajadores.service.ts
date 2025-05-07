import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CodigoVerificacionDTO, EmbajadorInvitadoDTO, InvitacionDTO } from 'src/app/models/DTOs/EmbajadorInvitadoDTO';
import { GenericResponseDTO, RespuestaEstatusMensaje } from 'src/app/models/DTOs/GenericResponseDTO';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmbajadoresService {
  private apiUrl = environment.apiUrl + "api/Embajadores"; 

  constructor(private http: HttpClient) {}

  postInvitarNuevoEmbajador(invitado:EmbajadorInvitadoDTO) : Observable<RespuestaEstatusMensaje> {
    console.log(invitado);
    return this.http.post<RespuestaEstatusMensaje>(`${this.apiUrl}/InvitarEmbajador`, invitado);
  }

  GetDatosInvitacion(codigo:string):Observable<InvitacionDTO>{
    return this.http.get<InvitacionDTO>(`${this.apiUrl}/GetDatosInvitacion?codigo=${codigo}`);
  }

  GetCodigoVerificacion (email:string):Observable<CodigoVerificacionDTO>{
    return this.http.get<CodigoVerificacionDTO>(`${this.apiUrl}/GetCodigoVerificacion?email=${email}`);
  }

  
}
