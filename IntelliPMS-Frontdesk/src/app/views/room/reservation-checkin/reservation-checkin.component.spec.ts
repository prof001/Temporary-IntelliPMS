import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationCheckinComponent } from './reservation-checkin.component';

describe('ReservationCheckinComponent', () => {
  let component: ReservationCheckinComponent;
  let fixture: ComponentFixture<ReservationCheckinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservationCheckinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationCheckinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
