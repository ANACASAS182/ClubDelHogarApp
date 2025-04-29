import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(private tokenService: TokenService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const isLoggedIn = await this.tokenService.isLoggedIn();
    
    if (isLoggedIn) {
      this.router.navigate(['/dashboard']);
      return false;
    } else {
      return true;
    }
  }
}