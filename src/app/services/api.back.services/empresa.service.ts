import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Empresa } from 'src/app/models/Empresa';

@Injectable({
  providedIn: 'root',
})

export class EmpresaService {
  private apiUrl = environment.apiUrl + "api/Empresa"; 

  constructor(private http: HttpClient) {}

  getAllEmpresas() : Observable<GenericResponseDTO<Empresa[]>> {
    return this.http.get<GenericResponseDTO<Empresa[]>>(`${this.apiUrl}/GetAllEmpresas`);
  }

  getAllEmpresasByUsuarioId(usuarioId:number) : Observable<GenericResponseDTO<Empresa[]>> {
    return this.http.get<GenericResponseDTO<Empresa[]>>(`${this.apiUrl}/getAllEmpresasByUsuarioId?usuarioId=${usuarioId}`);
  }


  getEmpresaByID(id: number) : Observable<GenericResponseDTO<Empresa>> {
    var params = new HttpParams().set("empresaID",id);
    return this.http.get<GenericResponseDTO<Empresa>>(`${this.apiUrl}/GetEmpresaByID`, {params});
  }

}