import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { environment } from 'src/environments/environment';

export interface EmpresaFiscalDTO {
  empresaID: number;
  rfc: string;
  razonSocialSAT: string;
  codigoPostal: string;
  metodoPago: string;
  usoCFDI: string;
  regimenClave?: string;
  constanciaPath?: string | null;
}

@Injectable({ providedIn: 'root' })
export class EmpresaFiscalService {
  private base = `${environment.apiUrl}api/fiscal`;

  constructor(private http: HttpClient) {}

  get(empresaId: number): Observable<GenericResponseDTO<EmpresaFiscalDTO|null>> {
    return this.http.get<GenericResponseDTO<EmpresaFiscalDTO|null>>(`${this.base}/empresa/${empresaId}`);
  }

  guardar(dto: EmpresaFiscalDTO): Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(`${this.base}/empresa/guardar`, dto);
  }
}