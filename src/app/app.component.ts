// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { TokenService } from './services/token.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  constructor(private tokenService: TokenService) {}

  async ngOnInit() {
    // Solo inicializa storage/token; NO navegues aquí
    await this.tokenService.init();
  }
}