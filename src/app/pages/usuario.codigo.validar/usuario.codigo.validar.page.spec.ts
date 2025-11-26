import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioCodigoValidarPage } from './usuario.codigo.validar.page';

describe('UsuarioCodigoValidarPage', () => {
  let component: UsuarioCodigoValidarPage;
  let fixture: ComponentFixture<UsuarioCodigoValidarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioCodigoValidarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
