import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckedinCheckedoutDetailsComponent } from './checkedin-checkedout-details.component';

describe('CheckedinCheckedoutDetailsComponent', () => {
  let component: CheckedinCheckedoutDetailsComponent;
  let fixture: ComponentFixture<CheckedinCheckedoutDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckedinCheckedoutDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckedinCheckedoutDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
