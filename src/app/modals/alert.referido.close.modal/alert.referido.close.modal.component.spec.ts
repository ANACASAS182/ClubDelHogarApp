import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AlertReferidoCloseModalComponent } from './alert.referido.close.modal.component';

describe('AlertReferidoCloseModalComponent', () => {
  let component: AlertReferidoCloseModalComponent;
  let fixture: ComponentFixture<AlertReferidoCloseModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertReferidoCloseModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertReferidoCloseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
