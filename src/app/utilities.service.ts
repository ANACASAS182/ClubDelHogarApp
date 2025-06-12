import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor() { }

  formatoFechaEspanol(fechaISO: string): string {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    // Convertimos la cadena ISO en un objeto Date
    const fecha = new Date(fechaISO);

    // Obtenemos los componentes
    const diaSemana = diasSemana[fecha.getUTCDay()];
    const diaMes = fecha.getUTCDate();
    const mes = meses[fecha.getUTCMonth()];
    const anio = fecha.getUTCFullYear();

    // Retornamos el formato deseado
    return `${diaSemana}, ${diaMes} de ${mes} de ${anio}`;
  }


  formatCurrency(value: number): string {
    return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  }

}
