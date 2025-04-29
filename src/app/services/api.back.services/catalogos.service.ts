import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { CatalogoPais } from 'src/app/models/CatalogoPais';
import { CatalogoEstado } from 'src/app/models/CatalogoEstado';

@Injectable({
  providedIn: 'root',
})

export class CatalogosService {
  private apiUrl = environment.apiUrl + "api/Catalogos"; 

  constructor(private http: HttpClient) {}

  getCatalogoPaises() : Observable<GenericResponseDTO<CatalogoPais[]>> {
    return this.http.get<GenericResponseDTO<CatalogoPais[]>>(`${this.apiUrl}/GetCatalogoPaises`);
  }

  getCatalogoEstados() : Observable<GenericResponseDTO<CatalogoEstado[]>> {
    return this.http.get<GenericResponseDTO<CatalogoEstado[]>>(`${this.apiUrl}/GetCatalogoEstadosMexicanos`);
  }


}