import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CelulaPage } from './celula.page';

describe('CelulaPage', () => {
  let component: CelulaPage;
  let fixture: ComponentFixture<CelulaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CelulaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
