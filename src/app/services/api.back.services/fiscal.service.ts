import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { environment } from 'src/environments/environment';

export interface UsuarioFiscal {
  usuarioID?: number;
  nombreSAT: string;
  rfc: string;
  curp?: string | null;
  codigoPostal: string;
  regimenClave: string;
  constanciaPath?: string | null;
  constanciaHash?: string | null;
  verificadoSAT?: boolean;
  fechaVerificacion?: string | null;
}

@Injectable({ providedIn: 'root' })
export class FiscalService {
  // apiUrl ya trae el host y termina con slash en tus envs.
  // El backend mapea en /api; aquí juntamos: https://host/ + api/fiscal
  private base = `${environment.apiUrl}api/fiscal`;

  constructor(private http: HttpClient) {}

  getRegimenes(persona?: 'F'|'M'|'A'):
    Observable<GenericResponseDTO<Array<{clave:string; descripcion:string}>>> {
    let params = new HttpParams();
    if (persona) params = params.set('persona', persona);
    return this.http.get<GenericResponseDTO<Array<{clave:string; descripcion:string}>>>(
      `${this.base}/regimenes`, { params }
    );
  }

  getMisDatos(): Observable<GenericResponseDTO<UsuarioFiscal|null>> {
    return this.http.get<GenericResponseDTO<UsuarioFiscal|null>>(`${this.base}/mis-datos`);
  }

  guardar(dto: UsuarioFiscal): Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(`${this.base}/guardar`, dto);
  }

  subirConstancia(file: File): Observable<GenericResponseDTO<{path:string; hash:string}>> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<GenericResponseDTO<{path:string; hash:string}>>(`${this.base}/subir-constancia`, fd);
  }

  /*getConstanciaBlob() {
  // baseUrl = `${environment.apiUrl}/fiscal`
    return this.http.get(`${this.base}/constancia`, { responseType: 'blob' });
  }*/

  descargarConstanciaBlob() {
    return this.http.get(`${this.base}/constancia/descargar`, { responseType: 'blob' });
  }
}