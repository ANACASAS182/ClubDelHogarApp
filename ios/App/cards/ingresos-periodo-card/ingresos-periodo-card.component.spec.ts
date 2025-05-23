import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IngresosPeriodoCardComponent } from './ingresos-periodo-card.component';

describe('IngresosPeriodoCardComponent', () => {
  let component: IngresosPeriodoCardComponent;
  let fixture: ComponentFixture<IngresosPeriodoCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IngresosPeriodoCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IngresosPeriodoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
