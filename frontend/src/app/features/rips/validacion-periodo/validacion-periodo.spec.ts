import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidacionPeriodo } from './validacion-periodo';

describe('ValidacionPeriodo', () => {
  let component: ValidacionPeriodo;
  let fixture: ComponentFixture<ValidacionPeriodo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidacionPeriodo],
    }).compileComponents();

    fixture = TestBed.createComponent(ValidacionPeriodo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
