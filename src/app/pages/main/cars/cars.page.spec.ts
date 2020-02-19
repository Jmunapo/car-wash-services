import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarsPage } from './cars.page';

describe('CarsPage', () => {
  let component: CarsPage;
  let fixture: ComponentFixture<CarsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
