import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CatalogosService } from '../services/api.back.services/catalogos.service';

@Injectable({ providedIn: 'root' })

export class ConfiguracionResolver implements Resolve<any> {
  constructor(private catalogosService : CatalogosService) {}

  resolve(): Observable<any> {
    return forkJoin({
      paises: this.catalogosService.getCatalogoPaises().pipe(map(response => response.data),catchError(() => of([]))),
      estados: this.catalogosService.getCatalogoEstados().pipe(map(response => response.data),catchError(() => of([])))
    });
  }
}