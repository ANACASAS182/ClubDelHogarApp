import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CatalogosService } from '../services/api.back.services/catalogos.service';
import { FuenteOrigenService } from '../services/api.back.services/fuente.origen.service';

@Injectable({ providedIn: 'root' })

export class UsuarioRegistroResolver implements Resolve<any> {
  constructor(private catalogosService : CatalogosService,
    private fuenteOrigenService: FuenteOrigenService) {}

  resolve(): Observable<any> {
    return forkJoin({
      fuentesOrigen: this.fuenteOrigenService.getCatalogoFuentesOrigen().pipe(map(response => response.data),catchError(() => of([]))),
      paises: this.catalogosService.getCatalogoPaises().pipe(map(response => response.data),catchError(() => of([]))),
      estados: this.catalogosService.getCatalogoEstados().pipe(map(response => response.data),catchError(() => of([])))
    });
  }
}