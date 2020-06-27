import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRoomInfoComponent } from './edit-room-info.component';

describe('EditRoomInfoComponent', () => {
  let component: EditRoomInfoComponent;
  let fixture: ComponentFixture<EditRoomInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRoomInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRoomInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
