import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Producto } from 'src/app/models/Producto';
import { PaginationModelDTO } from 'src/app/models/DTOs/PaginationModelDTO';

@Injectable({
  providedIn: 'root',
})

export class ProductoService {
  private apiUrl = environment.apiUrl + "api/Producto"; 

  constructor(private http: HttpClient) {}

  getAllProductosEmpresa(empresaID : number) : Observable<GenericResponseDTO<Producto[]>> {
    let params = new HttpParams().set("empresaID", empresaID);
    return this.http.get<GenericResponseDTO<Producto[]>>(`${this.apiUrl}/GetProductosEmpresa`,{params});
  }

  getProductoPaginated(params: { id: number, page: number, size: number, sortBy: string, sortDir: string }) : Observable<GenericResponseDTO<PaginationModelDTO<Producto[]>>>{
    
    let parameters = {
      empresaID:  params.id.toString(),
      page: params.page.toString(),
      size: params.size.toString(),
      sortBy: params.sortBy,
      sortDir: params.sortDir
    }

    return this.http.get<GenericResponseDTO<PaginationModelDTO<Producto[]>>>(`${this.apiUrl}/GetProductoPaginated`, {params : parameters});

  }
}