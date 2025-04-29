import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReferidoSeguimientoModalComponent } from './referido.seguimiento.modal.component';

describe('ReferidoSeguimientoModalComponent', () => {
  let component: ReferidoSeguimientoModalComponent;
  let fixture: ComponentFixture<ReferidoSeguimientoModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferidoSeguimientoModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReferidoSeguimientoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
