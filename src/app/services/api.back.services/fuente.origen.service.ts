import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { FuenteOrigenDTO } from 'src/app/models/DTOs/FuenteOrigenDTO';

@Injectable({
  providedIn: 'root',
})

export class FuenteOrigenService {
  private apiUrl = environment.apiUrl + "api/FuenteOrigen"; 

  constructor(private http: HttpClient) {}

  getCatalogoFuentesOrigen() : Observable<GenericResponseDTO<FuenteOrigenDTO[]>> {
    return this.http.get<GenericResponseDTO<FuenteOrigenDTO[]>>(`${this.apiUrl}/GetFuentesOrigen`);
  }

}