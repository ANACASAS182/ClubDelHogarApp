import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TokenService } from './services/token.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  constructor(
    private tokenService: TokenService,
    private nav: NavController,
    private router: Router
  ) {}

  async ngOnInit() {
    // Asegura que Ionic Storage esté listo
    await this.tokenService.init();

    // Decide ruta inicial SIN dejar historial previo
    const logged = await this.tokenService.isLoggedIn();
    await this.nav.navigateRoot(logged ? '/dashboard' : '/login');
  }
}
