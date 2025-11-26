import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriasService {
  private apiUrl = environment.apiUrl + 'api/cdh/productos';

  constructor(private http: HttpClient) {}

  getCategorias(): Observable<GenericResponseDTO<Categoria[]>> {
    return this.http.get<GenericResponseDTO<Categoria[]>>(
      `${this.apiUrl}/categorias`
    );
  }
}