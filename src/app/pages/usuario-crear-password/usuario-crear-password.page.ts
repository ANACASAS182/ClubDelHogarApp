import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiBackServicesCDH } from 'src/app/services/api.back.services.cdh/registro.service';

@Component({
  selector: 'app-usuario-crear-password',
  templateUrl: './usuario-crear-password.page.html',
  styleUrls: ['./usuario-crear-password.page.scss'],
  standalone: false
})
export class UsuarioCrearPasswordPage implements OnInit {

  telefono: string = "";
  password: string = "";
  password2: string = "";

  constructor(
    private route: ActivatedRoute,
    private api: ApiBackServicesCDH,
    private router: Router
  ) {}

  ngOnInit() {
    this.telefono = this.route.snapshot.queryParamMap.get('tel') || "";
  }

  guardar() {
    if (!this.password || this.password.length < 6) {
      alert("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    if (this.password !== this.password2) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const payload = {
      telefono: this.telefono,
      password: this.password
    };

    this.api.crearPassword(payload).subscribe({
      next: () => {
        alert("Contraseña creada correctamente");

        // guardar el teléfono para el perfil
        localStorage.setItem('cdh_tel', this.telefono);

        this.router.navigate(['/dashboard/network']);
      },
      error: err => {
        console.error(err);
        alert("Error guardando contraseña");
      }
    });

  }
}