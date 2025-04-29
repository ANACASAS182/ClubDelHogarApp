import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReferidosPage } from './referidos.page';

describe('ReferidosPage', () => {
  let component: ReferidosPage;
  let fixture: ComponentFixture<ReferidosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
