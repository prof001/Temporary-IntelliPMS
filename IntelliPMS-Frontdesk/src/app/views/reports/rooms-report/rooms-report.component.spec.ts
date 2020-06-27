import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomsReportComponent } from './rooms-report.component';

describe('RoomsReportComponent', () => {
  let component: RoomsReportComponent;
  let fixture: ComponentFixture<RoomsReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomsReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
