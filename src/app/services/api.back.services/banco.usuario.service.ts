import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { BancoUsuario } from 'src/app/models/BancoUsuario';

@Injectable({
  providedIn: 'root',
})

export class BancoUsuarioService {
  private apiUrl = environment.apiUrl + "api/BancoUsuario"; 

  constructor(private http: HttpClient) {}

  getBancoByID(id:number) : Observable<GenericResponseDTO<BancoUsuario>> {
    let params = new HttpParams().set("id", id);
    return this.http.get<GenericResponseDTO<BancoUsuario>>(`${this.apiUrl}/GetBancoByID`, {params});
  }

  getBancosUsuario() : Observable<GenericResponseDTO<BancoUsuario[]>> {
    return this.http.get<GenericResponseDTO<BancoUsuario[]>>(`${this.apiUrl}/GetBancosUsuario`);
  }

  save(model: BancoUsuario) : Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/Save`, model);
  }

  delete(id: number) : Observable<GenericResponseDTO<boolean>> {
    var params = new HttpParams().set("bancoID",id);
    return this.http.get<GenericResponseDTO<boolean>>(`${this.apiUrl}/SoftDelete`, {params});
  }


}