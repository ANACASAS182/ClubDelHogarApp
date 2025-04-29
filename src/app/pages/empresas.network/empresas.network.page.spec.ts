import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpresasNetworkPage } from './empresas.network.page';

describe('EmpresasNetworkPage', () => {
  let component: EmpresasNetworkPage;
  let fixture: ComponentFixture<EmpresasNetworkPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpresasNetworkPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
