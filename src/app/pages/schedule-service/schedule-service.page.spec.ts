import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleServicePage } from './schedule-service.page';

describe('ScheduleServicePage', () => {
  let component: ScheduleServicePage;
  let fixture: ComponentFixture<ScheduleServicePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleServicePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleServicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
