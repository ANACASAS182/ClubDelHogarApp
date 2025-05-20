import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-mensaje-temporal',
  templateUrl: './mensaje-temporal.component.html',
  styleUrls: ['./mensaje-temporal.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class MensajeTemporalComponent implements OnInit {

  @Input() mensaje: string = "Mensaje temporal";
  @Input() DuracionSegundos:number = 5;
  
  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.startBlackholeEffect();
    }, this.DuracionSegundos * 1000);
  }
  mensajeMostrado:boolean = false;
  triggerBlackhole = false;
  textHidden = false;

  startBlackholeEffect() {
    // Paso 1: Ocultar el texto
    this.textHidden = true;

    // Paso 2: Un poco después, agregar la clase para iniciar animación
    setTimeout(() => {
      this.triggerBlackhole = true;
    }, 200); // esperar que el texto se oculte

    // Paso 3: Quitar el div completamente tras animación (~2s)
    setTimeout(() => {
      this.mensajeMostrado = true;
    }, 2200); // limpiar o eliminar si quieres
  }

}
