import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCashRegisterComponent } from './manage-cash-register.component';

describe('OpenCashRegisterComponent', () => {
  let component: ManageCashRegisterComponent;
  let fixture: ComponentFixture<ManageCashRegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageCashRegisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCashRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
