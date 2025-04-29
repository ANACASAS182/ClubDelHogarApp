import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BancoUsuarioRegistroModalComponent } from './banco.usuario.registro.modal.component';

describe('BancoUsuarioRegistroModalComponent', () => {
  let component: BancoUsuarioRegistroModalComponent;
  let fixture: ComponentFixture<BancoUsuarioRegistroModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BancoUsuarioRegistroModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BancoUsuarioRegistroModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
