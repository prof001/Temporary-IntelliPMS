import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceBillsComponent } from './balance-bills.component';

describe('BalanceBillsComponent', () => {
  let component: BalanceBillsComponent;
  let fixture: ComponentFixture<BalanceBillsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BalanceBillsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
