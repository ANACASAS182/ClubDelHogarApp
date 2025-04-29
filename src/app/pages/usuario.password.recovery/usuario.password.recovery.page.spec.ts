import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioPasswordRecoveryPage } from './usuario.password.recovery.page';

describe('UsuarioPasswordRecoveryPage', () => {
  let component: UsuarioPasswordRecoveryPage;
  let fixture: ComponentFixture<UsuarioPasswordRecoveryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioPasswordRecoveryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
