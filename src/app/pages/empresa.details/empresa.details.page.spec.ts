import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpresaDetailsPage } from './empresa.details.page';

describe('EmpresaDetailsPage', () => {
  let component: EmpresaDetailsPage;
  let fixture: ComponentFixture<EmpresaDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpresaDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});