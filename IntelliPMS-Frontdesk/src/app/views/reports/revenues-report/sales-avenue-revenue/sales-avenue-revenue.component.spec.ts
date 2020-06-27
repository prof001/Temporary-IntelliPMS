import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAvenueRevenueComponent } from './sales-avenue-revenue.component';

describe('SalesAvenueRevenueComponent', () => {
  let component: SalesAvenueRevenueComponent;
  let fixture: ComponentFixture<SalesAvenueRevenueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesAvenueRevenueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesAvenueRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
