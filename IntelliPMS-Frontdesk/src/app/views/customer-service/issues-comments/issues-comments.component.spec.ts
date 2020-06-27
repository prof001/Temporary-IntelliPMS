import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuesCommentsComponent } from './issues-comments.component';

describe('IssuesCommentsComponent', () => {
  let component: IssuesCommentsComponent;
  let fixture: ComponentFixture<IssuesCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssuesCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuesCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
