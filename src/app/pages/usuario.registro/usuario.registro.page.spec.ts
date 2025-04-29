import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioRegistroPage } from './usuario.registro.page';

describe('UsuarioRegistroPage', () => {
  let component: UsuarioRegistroPage;
  let fixture: ComponentFixture<UsuarioRegistroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioRegistroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
