import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioCrearPasswordPage } from './usuario-crear-password.page';

describe('UsuarioCrearPasswordPage', () => {
  let component: UsuarioCrearPasswordPage;
  let fixture: ComponentFixture<UsuarioCrearPasswordPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioCrearPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
