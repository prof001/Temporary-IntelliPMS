import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomRevenueComponent } from './room-revenue.component';

describe('RoomRevenueComponent', () => {
  let component: RoomRevenueComponent;
  let fixture: ComponentFixture<RoomRevenueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomRevenueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
