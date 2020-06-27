import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphicalOverviewComponent } from './graphical-overview.component';

describe('GraphicalOverviewComponent', () => {
  let component: GraphicalOverviewComponent;
  let fixture: ComponentFixture<GraphicalOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphicalOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphicalOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
