import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioPasswordResetPage } from './usuario.password.reset.page';

describe('UsuarioPasswordResetPage', () => {
  let component: UsuarioPasswordResetPage;
  let fixture: ComponentFixture<UsuarioPasswordResetPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioPasswordResetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
