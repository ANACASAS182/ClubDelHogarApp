import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Usuario } from 'src/app/models/Usuario';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone:false
})
export class DashboardPage implements OnInit {
  userName :string = ''; 
  currentDate: string  = "";
  userRol:string = "Embajador"; //ROLES AUN NO ESTAN DEFINIDOS

  public appPages = [
    { title: 'Mi network', url: '/dashboard/network', icon: 'network' },
    { title: 'Referidos', url: '/dashboard/referidos', icon: 'referidos' },
    { title: 'Mi Célula', url: '/dashboard/celula', icon: 'network' },
    { title: 'Configuracion', url: '/dashboard/configuracion', icon: 'configuracion' }
    
  ];
  constructor(private router: Router, private tokenService : TokenService, private datePipe: DatePipe, private usuarioService: UsuarioService) { }

  ngOnInit() {
    const now = new Date();
    this.currentDate = this.datePipe.transform(now, 'fullDate') + ' - ' + this.datePipe.transform(now, 'hh:mm a');

    this.usuarioService.getUsuario().subscribe({
      next: (response: GenericResponseDTO<Usuario>)=>{
        this.userName = response.data.nombres + " " + response.data.apellidos;
      }
    });
  }

  async logout() {
    await this.tokenService.removeToken();
    this.router.navigate(['/login']);
  }


}
