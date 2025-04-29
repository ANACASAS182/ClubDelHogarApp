import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Empresa } from 'src/app/models/Empresa';
import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { IonHeader, IonItem, IonCard, IonToolbar, IonButton, IonButtons, IonContent, IonGrid, IonRow } from "@ionic/angular/standalone";

@Component({
  selector: 'app-empresas.network',
  templateUrl: './empresas.network.page.html',
  styleUrls: ['./empresas.network.page.scss'],
  standalone:false,
})
export class EmpresasNetworkPage implements OnInit {
  empresas : Empresa[]= [];

  constructor(private router : Router, private activeRoute: ActivatedRoute, private empresaService : EmpresaService) { } 
  
  ngOnInit() {  
    const resolverData = this.activeRoute.snapshot.data['resolverData'];
    this.empresas = resolverData.empresas;
  }


  verMas(item: any) {
    console.log('Ver más:', item);
    this.router.navigate(['/dashboard/empresa/detalle'], { queryParams: { empresaID: item.id } });
  }

}
