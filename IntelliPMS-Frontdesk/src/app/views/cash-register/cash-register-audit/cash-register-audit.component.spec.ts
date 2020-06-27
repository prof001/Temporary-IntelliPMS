import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashRegisterAuditComponent } from './cash-register-audit.component';

describe('CashRegisterAuditComponent', () => {
  let component: CashRegisterAuditComponent;
  let fixture: ComponentFixture<CashRegisterAuditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashRegisterAuditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashRegisterAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
