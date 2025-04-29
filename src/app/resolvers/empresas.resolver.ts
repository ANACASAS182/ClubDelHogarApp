import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EmpresaService } from '../services/api.back.services/empresa.service';

@Injectable({ providedIn: 'root' })

export class EmpresaResolver implements Resolve<any> {
  constructor(private empresaService: EmpresaService) {}

  resolve(): Observable<any> {
    return forkJoin({
      empresas: this.empresaService.getAllEmpresas().pipe(map(response => response.data),catchError(() => of([])))
    });
  }
}