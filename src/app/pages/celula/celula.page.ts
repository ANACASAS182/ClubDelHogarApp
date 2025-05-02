import { Component, OnInit } from '@angular/core';
import { UsuarioCelula } from 'src/app/models/DTOs/CelulaDTO';
import { UsuarioService } from '../../services/api.back.services/usuario.service';

@Component({
  selector: 'app-celula',
  templateUrl: './celula.page.html',
  styleUrls: ['./celula.page.scss'],
  standalone: false
})
export class CelulaPage implements OnInit {

  constructor(private _usuarioService:UsuarioService) { }

  celula?: UsuarioCelula;

  ngOnInit(): void {
    this._usuarioService.getCelulaLocal(1).subscribe({
      next: (data) =>{
        console.log("celula");
        console.log(data);
        this.celula = data;
      },
      error: (err) =>{},
      complete:() => {}
    });

  }

}


