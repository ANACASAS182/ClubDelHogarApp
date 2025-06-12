import { Component, Input, OnInit } from '@angular/core';
import { Promocion } from 'src/app/models/Promocion';
import { IonGrid, IonRow, IonCol } from "@ionic/angular/standalone";

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  imports:[IonGrid, IonRow, IonCol],
  styleUrls: ['./producto.component.scss'],
})
export class ProductoComponent  implements OnInit {

  constructor() { }
  @Input() promocion?:Promocion;

  ngOnInit() {
    
  }

}
