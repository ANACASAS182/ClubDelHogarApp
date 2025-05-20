import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivacionesPage } from './activaciones.page';

describe('ActivacionesPage', () => {
  let component: ActivacionesPage;
  let fixture: ComponentFixture<ActivacionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
