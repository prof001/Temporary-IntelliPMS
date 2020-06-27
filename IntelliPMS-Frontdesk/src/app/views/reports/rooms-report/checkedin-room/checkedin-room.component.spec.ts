import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckedinRoomComponent } from './checkedin-room.component';

describe('CheckedinRoomComponent', () => {
  let component: CheckedinRoomComponent;
  let fixture: ComponentFixture<CheckedinRoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckedinRoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckedinRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
