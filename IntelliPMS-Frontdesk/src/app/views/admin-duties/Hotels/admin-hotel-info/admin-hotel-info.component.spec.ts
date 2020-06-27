import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHotelInfoComponent } from './admin-hotel-info.component';

describe('AdminHotelInfoComponent', () => {
  let component: AdminHotelInfoComponent;
  let fixture: ComponentFixture<AdminHotelInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminHotelInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminHotelInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
