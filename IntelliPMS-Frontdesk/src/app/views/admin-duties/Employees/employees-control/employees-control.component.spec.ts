import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesControlComponent } from './employees-control.component';

describe('EmployeesControlComponent', () => {
  let component: EmployeesControlComponent;
  let fixture: ComponentFixture<EmployeesControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeesControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeesControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
