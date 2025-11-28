import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';

// --- DTOs ---

export interface CodigoValidarDTO {
  telefono?: string;
  correo?: string;
  codigo: string;
}

export interface CuponResumenDTO {
  cuponID: number;
  codigo: string;
  estatus: number;            // 1 = generado, 3 = canjeado
  productoID: number;
  productoNombre: string;
  empresaID: number;
  empresaNombre: string;
  usuarioID?: number | null;
  usuarioNombre: string;
  usuarioTelefono: string;
  fechaCreacion: string;
  fechaHoraActivacion?: string | null;
}

export interface CuponesResumenEmbajadorDTO {
  totalGenerados: number;
  totalCanjeados: number;
  generados: CuponResumenDTO[];
  canjeados: CuponResumenDTO[];
}

@Injectable({ providedIn: 'root' })
export class ApiBackServicesCDH {

  private apiUrl = environment.apiUrl + 'api/cdh/registro';

  constructor(private http: HttpClient) {}

  // 👉 Enviar código (teléfono o correo)
  enviarCodigo(body: {
    telefono?: string;
    correo?: string;
    usarCorreo: boolean;
  }): Observable<GenericResponseDTO<string>> {
    return this.http.post<GenericResponseDTO<string>>(
      `${this.apiUrl}/enviar-codigo`,
      body
    );
  }

  // 👉 Validar código
  validarCodigo(body: {
    telefono?: string;
    correo?: string;
    codigo: string;
  }): Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(
      `${this.apiUrl}/validar-codigo`,
      body
    );
  }

  crearPassword(payload: any) {
    return this.http.post(`${this.apiUrl}/crear-password`, payload);
  }

  // 👉 Resumen de cupones por embajador
  getResumenCuponesEmbajador(
    embajadorId: number
  ): Observable<GenericResponseDTO<CuponesResumenEmbajadorDTO>> {
    return this.http.get<GenericResponseDTO<CuponesResumenEmbajadorDTO>>(
      `${this.apiUrl}/resumen-cupones-embajador/${embajadorId}`
    );
  }
}