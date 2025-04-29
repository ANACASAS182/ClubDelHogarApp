import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReferidoRegistroModalComponent } from './referido.registro.modal.component';

describe('ReferidoRegistroModalComponent', () => {
  let component: ReferidoRegistroModalComponent;
  let fixture: ComponentFixture<ReferidoRegistroModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferidoRegistroModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReferidoRegistroModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
